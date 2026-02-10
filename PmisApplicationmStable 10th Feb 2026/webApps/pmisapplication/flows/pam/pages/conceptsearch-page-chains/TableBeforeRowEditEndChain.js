define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ActionUtils
) => {
  'use strict';

  class TableBeforeRowEditEndChain extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $variables } = context;

      // Get parameters
      const cancelEdit = context.params.cancelEdit;
      const rowKey = context.params.rowKey;
      const rowData = context.params.rowData;
      const updatedRow = context.params.updatedRow;

      console.log("🟢 TableBeforeRowEditEnd - Cancel Edit:", cancelEdit);
      console.log("🟢 TableBeforeRowEditEnd - Row Key:", rowKey);
      console.log("🟢 TableBeforeRowEditEnd - Updated Row:", updatedRow);

      // If user clicked Cancel button, just exit
      if (cancelEdit) {
        console.log("❌ Edit cancelled by user");
        return;
      }

      // ========== SAVE MODE ==========
      try {
        // Show saving notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Saving...',
          message: 'Saving schedule data',
          type: 'info',
          displayMode: 'transient',
        });

        // Determine if this is CREATE or EDIT mode
        if (updatedRow.cs_dtl_id && updatedRow.cs_dtl_id > 0) {
          // EDIT MODE - Update existing record
          console.log("🔄 UPDATE MODE - Editing existing record");
           await this.updateschedule(context, updatedRow, rowKey);
        } else {
          // CREATE MODE - Insert new record
          console.log("➕ CREATE MODE - Creating new record");
          await this.createSchedule(context, updatedRow, rowKey);
        }

      } catch (error) {
        console.error("❌ Error saving record:", error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Save Failed',
          message: 'Failed to save record: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

    // ========== UPDATE EXISTING RECORD ==========
    async updateSchedule(context, updatedRow, rowKey) {
      const { $variables, $application } = context;

      console.log("🔄 Updating record with ID:", updatedRow.cs_dtl_id);

      // Format dates for Oracle
      const formatDateForOracle = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Prepare method (PUT)
      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'PUT',
        },
      });

      // Prepare payload
      const payload = {
        cs_dtl_id: updatedRow.cs_dtl_id,
        object_version_num: updatedRow.object_version_num,
        project_id: updatedRow.project_id,
        phase_id: updatedRow.phase_id,
        milestone_id: updatedRow.milestone_id,
        cs_senior_mgr_id: updatedRow.cs_senior_mgr_id,
        cs_planning_mgr_id: updatedRow.cs_planning_mgr_id,
        consultant_id: updatedRow.consultant_id,
        budget_amount: updatedRow.budget_amount,
        planned_start_date: formatDateForOracle(updatedRow.planned_start_date),
        planned_end_date: formatDateForOracle(updatedRow.planned_end_date),
        revised_start_date: formatDateForOracle(updatedRow.revised_start_date),
        revised_end_date: formatDateForOracle(updatedRow.revised_end_date),
        actual_start_date: formatDateForOracle(updatedRow.actual_start_date),
        actual_end_date: formatDateForOracle(updatedRow.actual_end_date),
        completion_percentage: updatedRow.completion_percentage,
        remarks: updatedRow.remarks,
        created_by: updatedRow.created_by,
        created_date: updatedRow.creation_date,
        last_updated_by: $application.user.email || 'CURRENT_USER',
        last_updated_date: new Date().toISOString(),
        last_updated_login: $application.user.email || 'CURRENT_USER'
      };

      console.log("📦 Update Payload:", payload);

      // Encrypt payload
      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: payload,
        },
      });

      // Encrypt session ID
      const encryptedSessionId = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: updatedRow.cs_dtl_id.toString(),
        },
      });

      // Call ORDS endpoint
      const response = await Actions.callRest(context, {
        endpoint: 'PAM/postPmispamConceptstudyProcess',
        headers: {
          'x-session-id': encryptedSessionId,
          'x-session-code': method,
        },
        body: { "payload": encryptedPayload },
      });

      console.log("📥 ORDS Response:", response.body);

      // Check response
      if (response.body.P_ERR_CODE === 'S') {
        console.log("✅ Update successful");

        // Update the BufferingDataProvider with new data
        const updateItem = {
          ...updatedRow,
          object_version_num: (updatedRow.object_version_num || 0) + 1,
          last_updated_by: $application.user.email || 'CURRENT_USER',
          last_update_date: new Date().toISOString()
        };

        // Update in buffer
        $variables.bufferDPTable.updateItem({
          metadata: { key: rowKey },
          data: updateItem
        });

        // Success notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Updated Successfully',
          message: 'Record updated successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

        // Refresh the table data
        await Actions.callChain(context, {
          chain: 'refreshactionchain'
        });

      } else {
        console.error("❌ Update failed:", response.body.p_err_msg);

        await Actions.fireNotificationEvent(context, {
          summary: 'Update Failed',
          message: response.body.p_err_msg || 'Failed to update record',
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

    // ========== CREATE NEW RECORD ==========
    async createSchedule(context, updatedRow, rowKey) {
      const { $variables, $application } = context;

      console.log("➕ Creating new record");

      // Format dates for Oracle
      const formatDateForOracle = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Encrypt key (0 for new record)
      const encryptedKey = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: '0',
        },
      });

      // Prepare method (POST)
      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'POST',
        },
      });

      // Prepare payload
      const payload = {
        project_id: updatedRow.project_id,
        phase_id: updatedRow.phase_id,
        milestone_id: updatedRow.milestone_id,
        cs_senior_mgr_id: updatedRow.cs_senior_mgr_id,
        cs_planning_mgr_id: updatedRow.cs_planning_mgr_id,
        consultant_id: updatedRow.consultant_id,
        budget_amount: updatedRow.budget_amount,
        planned_start_date: formatDateForOracle(updatedRow.planned_start_date),
        planned_end_date: formatDateForOracle(updatedRow.planned_end_date),
        revised_start_date: formatDateForOracle(updatedRow.revised_start_date),
        revised_end_date: formatDateForOracle(updatedRow.revised_end_date),
        actual_start_date: formatDateForOracle(updatedRow.actual_start_date),
        actual_end_date: formatDateForOracle(updatedRow.actual_end_date),
        completion_percentage: updatedRow.completion_percentage,
        remarks: updatedRow.remarks,
        created_by: $application.user.email || 'CURRENT_USER',
        created_date: new Date().toISOString(),
        last_updated_by: $application.user.email || 'CURRENT_USER',
        last_updated_date: new Date().toISOString(),
        last_updated_login: $application.user.email || 'CURRENT_USER'
      };

      console.log("📦 Create Payload:", payload);

      // Encrypt payload
      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: payload,
        },
      });

      // Call ORDS endpoint
      const response = await Actions.callRest(context, {
        endpoint: 'PAM/postPmispamConceptstudyProcess',
        headers: {
          'x-session-id': encryptedKey,
          'x-session-code': method,
        },
        body: { "payload": encryptedPayload },
      });

      console.log("📥 ORDS Response:", response.body);

      // Check response
      if (response.body.P_ERR_CODE === 'S') {
        console.log("✅ Create successful");

        // Get new ID from response
        const newId = response.headers.get('X-Session-Id') || response.headers.get('x-session-id');
        const newObjectVersion = response.body.object_version_num || 1;

        // Update the row with new ID
        const newItem = {
          ...updatedRow,
          cs_dtl_id: parseInt(newId) || $variables.lvNextValue,
          object_version_num: newObjectVersion,
          created_by: $application.user.email || 'CURRENT_USER',
          creation_date: new Date().toISOString(),
          last_updated_by: $application.user.email || 'CURRENT_USER',
          last_update_date: new Date().toISOString()
        };

        // Update in buffer
        $variables.bufferDPTable.updateItem({
          metadata: { key: rowKey },
          data: newItem
        });

        // Success notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Created Successfully',
          message: 'Concept Study has been created successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

        // Refresh the table data
        await Actions.callChain(context, {
          chain: 'refreshactionchain'
        });

      } else {
        console.error("❌ Create failed:", response.body.p_err_msg);

        await Actions.fireNotificationEvent(context, {
          summary: 'Create Failed',
          message: response.body.p_err_msg || 'Failed to create record',
          type: 'error',
          displayMode: 'transient',
        });
      }
    }
  }

  return TableBeforeRowEditEndChain;
});