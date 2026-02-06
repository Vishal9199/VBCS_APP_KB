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

  class saveMasterPlanAction extends ActionChain {

    async run(context) {
      const { $page, $variables, $application, $constants } = context;

      if ($variables.formValidation === "valid" && $variables.formValidation2 === "valid" && $variables.formValidation3 === "valid") {

        try {
          // ========== VALIDATION ==========
          // if (!$variables.masterPlanHeaderVar.mp_ref_num) {
          //   await Actions.fireNotificationEvent(context, {
          //     summary: 'Validation Error',
          //     message: 'record Reference Number is required',
          //     type: 'error',
          //     displayMode: 'transient',
          //   });
          //   return;
          // }

          // Show saving notification
          await Actions.fireNotificationEvent(context, {
            summary: 'Saving...',
            message: 'Saving schedule data',
            type: 'info',
            displayMode: 'transient',
          });

          if ($variables.pNavCode === "EDIT") {
            // ========== EDIT MODE ==========
            await this.updateschedule(context);
          } else {
            // ========== CREATE MODE ==========
            await this.createschedule(context);
          }

        } catch (error) {
          console.error("Error saving record:", error);

          await Actions.fireNotificationEvent(context, {
            summary: 'Save Failed',
            message: 'Failed to save record: ' + error.message,
            type: 'error',
            displayMode: 'transient',
          });
        }
      }
      else {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please fix the required field(s)',
          displayMode: 'transient',
          type: 'warning',
        });
      }
    }

    // ========== EDIT MODE - UPDATE ==========
    async updateschedule(context) {
      const { $variables, $application, $constants } = context;

      console.log("🔄 UPDATE MODE - Editing existing record");

      // Step 1: Encrypt key

      // Step 2: Prepare method
      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'PUT',
        },
      });

      // // Step 3: Prepare payload
      // const payload = {
      //   cs_dtl_id: $variables.pamScheduleDetailVar.cs_dtl_id,
      //   object_version_num: $variables.pamScheduleDetailVar.object_version_num,
      //   project_id: $variables.pamScheduleDetailVar.project_id,
      //   phase_id: $variables.pamScheduleDetailVar.phase_id,
      //   milestone_id: $variables.pamScheduleDetailVar.milestone_id,
      //   cs_senior_mgr_id: $variables.pamScheduleDetailVar.cs_senior_mgr_id,
      //   cs_planning_mgr_id: $variables.pamScheduleDetailVar.cs_planning_mgr_id,
      //   consultant_id: $variables.pamScheduleDetailVar.consultant_id,
      //   budget_amount: $variables.pamScheduleDetailVar.budget_amount,
      //   planned_start_date: $variables.pamScheduleDetailVar.planned_start_date,
      //   planned_end_date: $variables.pamScheduleDetailVar.planned_end_date,
      //   revised_start_date: $variables.pamScheduleDetailVar.revised_start_date,
      //   revised_end_date: $variables.pamScheduleDetailVar.revised_end_date,
      //   actual_start_date: $variables.pamScheduleDetailVar.actual_start_date,
      //   actual_end_date: $variables.pamScheduleDetailVar.actual_end_date,
      //   completion_percentage: $variables.pamScheduleDetailVar.completion_percentage,
      //   remarks: $variables.pamScheduleDetailVar.remarks,
      //   created_by: $variables.pamScheduleDetailVar.created_by,
      //   created_date: $variables.pamScheduleDetailVar.created_date,
      //   last_updated_by: $application.user.email || 'CURRENT_USER',
      //   last_updated_date: $application.functions.getSysdate,
      //   last_updated_login: $application.user.email || 'CURRENT_USER'
      // };

      const formatDateForOracle = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Returns: "2026-02-18"
      };

      // Step 3: Prepare payload with formatted dates
      const payload = {
        cs_dtl_id: $variables.pamScheduleDetailVar.cs_dtl_id,
        object_version_num: $variables.pamScheduleDetailVar.object_version_num,
        project_id: $variables.pamScheduleDetailVar.project_id,
        phase_id: $variables.pamScheduleDetailVar.phase_id,
        milestone_id: $variables.pamScheduleDetailVar.milestone_id,
        cs_senior_mgr_id: $variables.pamScheduleDetailVar.cs_senior_mgr_id,
        cs_planning_mgr_id: $variables.pamScheduleDetailVar.cs_planning_mgr_id,
        consultant_id: $variables.pamScheduleDetailVar.consultant_id,
        budget_amount: $variables.pamScheduleDetailVar.budget_amount,
        planned_start_date: formatDateForOracle($variables.pamScheduleDetailVar.planned_start_date),
        planned_end_date: formatDateForOracle($variables.pamScheduleDetailVar.planned_end_date),
        revised_start_date: formatDateForOracle($variables.pamScheduleDetailVar.revised_start_date),
        revised_end_date: formatDateForOracle($variables.pamScheduleDetailVar.revised_end_date),
        actual_start_date: formatDateForOracle($variables.pamScheduleDetailVar.actual_start_date),
        actual_end_date: formatDateForOracle($variables.pamScheduleDetailVar.actual_end_date),
        completion_percentage: $variables.pamScheduleDetailVar.completion_percentage,
        remarks: $variables.pamScheduleDetailVar.remarks,
        created_by: $variables.pamScheduleDetailVar.created_by,
        created_date: $variables.pamScheduleDetailVar.created_date,
        last_updated_by: $application.user.email || 'CURRENT_USER',
        last_updated_date: $application.functions.getSysdate,
        last_updated_login: $application.user.email || 'CURRENT_USER'
      };
      console.log("📦 Update Payload:", payload);;

      console.log("📦 Update Payload:", payload);

      // Step 4: Encrypt payload
      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: payload,
        },
      });

      console.log("🔐 Payload encrypted");

      // Step 5: Call ORDS endpoint
      const response = await Actions.callRest(context, {
        endpoint: 'PAM/postPmispamConceptstudyProcess',
        headers: {
          'x-session-id': $variables.pNavId,
          'x-session-code': method,
        },
        body: { "payload": encryptedPayload },
      });

      console.log("📥 ORDS Response:", response.body);

      // Step 6: Check response
      if (response.body.P_ERR_CODE === 'S') {
        console.log("✅ Update successful");

        // Update object_version_num if returned
        if (response.body.object_version_num) {
          $variables.pamScheduleDetailVar.object_version_num = response.body.object_version_num + 1;
        }

        // Success notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Updated Successfully',
          message: 'record updated successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

      } else {
        // Error from ORDS
        console.error("❌ Update failed:", response.body.p_err_msg);

        await Actions.fireNotificationEvent(context, {
          summary: 'Update Failed',
          message: response.body.p_err_msg || 'Failed to update record',
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

    // ========== CREATE MODE - INSERT ==========
    async createschedule(context) {
      const { $variables, $application, $constants } = context;

      console.log("➕ CREATE MODE - Creating new record");

      // Step 1: Encrypt key
      const encryptedKey = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: '0',
        },
      });

      // Step 2: Prepare method
      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'POST',
        },
      });

      // Step 3: Prepare payload
      const payload = {
        cs_dtl_id: $variables.pamScheduleDetailVar.cs_dtl_id,
        object_version_num: $variables.pamScheduleDetailVar.object_version_num,
        project_id: $variables.pamScheduleDetailVar.project_id,
        phase_id: $variables.pamScheduleDetailVar.phase_id,
        milestone_id: $variables.pamScheduleDetailVar.milestone_id,
        cs_senior_mgr_id: $variables.pamScheduleDetailVar.cs_senior_mgr_id,
        cs_planning_mgr_id: $variables.pamScheduleDetailVar.cs_planning_mgr_id,
        consultant_id: $variables.pamScheduleDetailVar.consultant_id,
        budget_amount: $variables.pamScheduleDetailVar.budget_amount,
        planned_start_date: $variables.pamScheduleDetailVar.planned_start_date,
        planned_end_date: $variables.pamScheduleDetailVar.planned_end_date,
        revised_start_date: $variables.pamScheduleDetailVar.revised_start_date,
        revised_end_date: $variables.pamScheduleDetailVar.revised_end_date,
        actual_start_date: $variables.pamScheduleDetailVar.actual_start_date,
        actual_end_date: $variables.pamScheduleDetailVar.actual_end_date,
        completion_percentage: $variables.pamScheduleDetailVar.completion_percentage,
        remarks: $variables.pamScheduleDetailVar.remarks,
        created_by: $variables.pamScheduleDetailVar.created_by,
        created_date: $variables.pamScheduleDetailVar.created_date,
        last_updated_by: $application.user.email || 'CURRENT_USER',
        last_updated_date: $application.functions.getSysdate,
        last_updated_login: $application.user.email || 'CURRENT_USER'
      };

      console.log("📦 Create Payload:", payload);

      // Step 4: Encrypt payload
      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: payload,
        },
      });

      console.log("🔐 Payload encrypted");

      // Step 5: Call ORDS endpoint
      const response = await Actions.callRest(context, {
        endpoint: 'PAM/postPmispamConceptstudyProcess',
        headers: {
          'x-session-id': encryptedKey,
          'x-session-code': method,
        },
        body: { "payload": encryptedPayload },
      });

      console.log("📥 ORDS Response:", response.body);

      // Step 6: Check response
      console.log("Starting to check Header Response....");
      if (response.body.P_ERR_CODE === 'S') {

        // Success notification
        await Actions.fireNotificationEvent(context, {
          summary: 'response.body.P_ERR_MSG',
          type: 'confirmation',
          displayMode: 'transient',
        });
        console.log("✅ Create successful");

        const newProjectId = response.headers.get('X-Session-Id') || response.headers.get('x-session-id') ||
          response.headers.get('X-session-id');
        const newObjectVersion = response.body.object_version_num || 1;
        // const encryptedSessionId = response.body.encrypted_session_id;

        // console.log("🆔 New Project ID:", newProjectId);
        // console.log("🔐 Encrypted Session ID:", encryptedSessionId);

        // Update masterPlanHeaderVar with returned values
        // $variables.masterPlanHeaderVar.project_id = newProjectId;
        $variables.pamScheduleDetailVar.object_version_num = newObjectVersion;

        // ========== SWITCH TO EDIT MODE ==========
        $variables.pNavCode = 'EDIT';
        $variables.pNavId = newProjectId;
        $variables.editMode = 'edit';

        console.log("🔄 Mode switched to EDIT");

        // Update browser URL
        // const newUrl = `?pNavCode=EDIT&pNavId=${encryptedSessionId}`;
        // window.history.replaceState({}, '', newUrl);

      } else {
        // Error from ORDS
        console.error("❌ Create failed:", response.body.p_err_msg);

        await Actions.fireNotificationEvent(context, {
          summary: response.body.p_err_msg,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

    // ========== HELPER: Save Budget Lines ==========

    // ========== HELPER: Reload Page Data ==========
  }

  return saveMasterPlanAction;
});