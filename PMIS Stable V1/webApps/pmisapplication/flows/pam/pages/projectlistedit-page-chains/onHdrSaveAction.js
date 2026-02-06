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

      if ($variables.formValidation === "valid" && $variables.formValidation2 === "valid") {

        try {
          // ========== VALIDATION ==========
          // if (!$variables.masterPlanHeaderVar.mp_ref_num) {
          //   await Actions.fireNotificationEvent(context, {
          //     summary: 'Validation Error',
          //     message: 'Master Plan Reference Number is required',
          //     type: 'error',
          //     displayMode: 'transient',
          //   });
          //   return;
          // }

          // Show saving notification
          await Actions.fireNotificationEvent(context, {
            summary: 'Saving...',
            message: 'Saving Master Plan data',
            type: 'info',
            displayMode: 'transient',
          });

          if ($variables.pNavCode === "EDIT") {
            // ========== EDIT MODE ==========
            await this.updateMasterPlan(context);
          } else {
            // ========== CREATE MODE ==========
            await this.createMasterPlan(context);
          }

        } catch (error) {
          console.error("Error saving Master Plan:", error);

          await Actions.fireNotificationEvent(context, {
            summary: 'Save Failed',
            message: 'Failed to save Master Plan: ' + error.message,
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
    async updateMasterPlan(context) {
      const { $variables, $application, $constants } = context;

      console.log("🔄 UPDATE MODE - Editing existing Master Plan");

      // Step 1: Encrypt key

      // Step 2: Prepare method
      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'PUT',
        },
      });

      // Step 3: Prepare payload
      const payload = {
        project_id: $variables.masterPlanHeaderVar.project_id,
        object_version_num: $variables.masterPlanHeaderVar.object_version_num,
        mp_ref_id: $variables.masterPlanHeaderVar.mp_ref_id,
        // mp_ref_num: $variables.masterPlanHeaderVar.mp_ref_num,
        mp_ref_plan_name: $variables.masterPlanHeaderVar.mp_ref_plan_name,
        project_type_id: $variables.masterPlanHeaderVar.project_type_id,
        project_category_id: $variables.masterPlanHeaderVar.project_category_id,
        project_name: $variables.masterPlanHeaderVar.project_name,
        project_long_name: $variables.masterPlanHeaderVar.project_long_name,
        region_id: $variables.masterPlanHeaderVar.region_id,
        project_location_id: $variables.masterPlanHeaderVar.project_location_id,
        category_id: $variables.masterPlanHeaderVar.category_id,
        description: $variables.masterPlanHeaderVar.description,
        five_year_prj_flag: $variables.masterPlanHeaderVar.five_year_prj_flag,
        latest_est_budget_val: $variables.masterPlanHeaderVar.latest_est_budget_val,
        scp_approved_budget_val: $variables.masterPlanHeaderVar.scp_approved_budget_val,
        active_flag: $variables.masterPlanHeaderVar.active_flag,
        inactive_date: $variables.masterPlanHeaderVar.inactive_date,
        budget_year_id: $variables.masterPlanHeaderVar.budget_year_id,
        comments: $variables.masterPlanHeaderVar.comments,
        additional_info: $variables.masterPlanHeaderVar.additional_info,
        last_updated_by: $application.user.email || 'CURRENT_USER',
        last_updated_date: $application.functions.getSysdate,
        last_updated_login: $application.user.email || 'CURRENT_USER'
      };

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
        endpoint: 'PAM/postPmispamProjectmasterplanProcess',
        headers: {
          'x-session-id': $variables.pNavId,
          'x-session-code': method,
        },
        body: {
          payload: encryptedPayload,
        },
      });

      console.log("📥 ORDS Response:", response.body);

      // Step 6: Check response
      if (response.body.P_ERR_CODE === 'S') {
        console.log("✅ Update successful");

        // Update object_version_num if returned
        if (response.body.object_version_num) {
          $variables.masterPlanHeaderVar.object_version_num = response.body.object_version_num + 1;
        }

        // Save budget lines if any
        await this.saveBudgetLines(context);

        // Success notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Updated Successfully',
          message: 'Master Plan updated successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

        // Reload data
        await this.reloadPageData(context);

      } else {
        // Error from ORDS
        console.error("❌ Update failed:", response.body.p_err_msg);

        await Actions.fireNotificationEvent(context, {
          summary: 'Update Failed',
          message: response.body.p_err_msg || 'Failed to update Master Plan',
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

    // ========== CREATE MODE - INSERT ==========
    async createMasterPlan(context) {
      const { $variables, $application, $constants } = context;

      console.log("➕ CREATE MODE - Creating new Master Plan");

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
        mp_ref_num: $variables.masterPlanHeaderVar.mp_ref_num,
        mp_ref_plan_name: $variables.masterPlanHeaderVar.mp_ref_plan_name,
        project_type_id: $variables.masterPlanHeaderVar.project_type_id,
        project_category_id: $variables.masterPlanHeaderVar.project_category_id,
        project_name: $variables.masterPlanHeaderVar.project_name,
        project_long_name: $variables.masterPlanHeaderVar.project_long_name,
        region_id: $variables.masterPlanHeaderVar.region_id,
        project_location_id: $variables.masterPlanHeaderVar.project_location_id,
        category_id: $variables.masterPlanHeaderVar.category_id,
        description: $variables.masterPlanHeaderVar.description,
        five_year_prj_flag: $variables.masterPlanHeaderVar.five_year_prj_flag || 'N',
        latest_est_budget_val: $variables.masterPlanHeaderVar.latest_est_budget_val || 0,
        scp_approved_budget_val: $variables.masterPlanHeaderVar.scp_approved_budget_val || 0,
        active_flag: $variables.masterPlanHeaderVar.active_flag || 'Y',
        inactive_date: $variables.masterPlanHeaderVar.inactive_date,
        budget_year_id: $variables.masterPlanHeaderVar.budget_year_id,
        comments: $variables.masterPlanHeaderVar.comments,
        additional_info: $variables.masterPlanHeaderVar.additional_info,
        created_by: $application.user.email || 'CURRENT_USER',
        created_date: new Date().toISOString(),
        last_updated_by: $application.user.email || 'CURRENT_USER',
        last_updated_date: new Date().toISOString(),
        last_updated_login: $application.user.email || 'CURRENT_USER',
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
        endpoint: 'PAM/postPmispamProjectmasterplanProcess',
        headers: {
          'x-session-id': encryptedKey,
          'x-session-code': method,
        },
        body: {
          payload: encryptedPayload,
        },
      });

      console.log("📥 ORDS Response:", response.body);

      // Step 6: Check response
      console.log("Starting to check Header Response....");
      if (response.body.P_ERR_CODE === 'S') {
        console.log("✅ Create successful");

        const newProjectId = response.headers.get('X-Session-Id') || response.headers.get('x-session-id') ||
          response.headers.get('X-session-id');
        const newObjectVersion = response.body.object_version_num || 1;
        // const encryptedSessionId = response.body.encrypted_session_id;

        // console.log("🆔 New Project ID:", newProjectId);
        // console.log("🔐 Encrypted Session ID:", encryptedSessionId);

        // Update masterPlanHeaderVar with returned values
        // $variables.masterPlanHeaderVar.project_id = newProjectId;
        $variables.masterPlanHeaderVar.object_version_num = newObjectVersion;

        // ========== SWITCH TO EDIT MODE ==========
        $variables.pNavCode = 'EDIT';
        $variables.pNavId = newProjectId;
        $variables.editMode = 'edit';

        console.log("🔄 Mode switched to EDIT");

        // Update browser URL
        // const newUrl = `?pNavCode=EDIT&pNavId=${encryptedSessionId}`;
        // window.history.replaceState({}, '', newUrl);

        // Save budget lines if any
        await this.saveBudgetLines(context);

        // Success notification
        await Actions.fireNotificationEvent(context, {
          summary: response.body.p_err_msg,
          type: 'confirmation',
          displayMode: 'transient',
        });

        // Reload data
        await this.reloadPageData(context);

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
    async saveBudgetLines(context) {
      const { $variables } = context;

      const budgetLines = $variables.ADPbudgetCostLines.data || [];

      if (budgetLines.length === 0) {
        console.log("ℹ️ No budget lines to save");
        return;
      }

      console.log(`💾 Saving ${budgetLines.length} budget line(s)...`);

      // Loop through each budget line
      for (const budgetLine of budgetLines) {
        try {
          // Determine if INSERT or UPDATE
          const isNew = !budgetLine.budget_cost_id || budgetLine.budget_cost_id < 0;
          const method = isNew ? 'POST' : 'PUT';

          console.log(`${isNew ? '➕ Inserting' : '🔄 Updating'} budget line`);

          // Encrypt key
          const encryptedKey = await Actions.callChain(context, {
            chain: 'application:encryptAC',
          });

          // Prepare payload
          const budgetPayload = {
            ...budgetLine,
            project_id: $variables.masterPlanHeaderVar.project_id,
          };

          if (isNew) {
            // budgetPayload.created_by = 'CURRENT_USER';
            // budgetPayload.created_date = new Date().toISOString();
          }

          // Encrypt payload
          const encryptedPayload = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              payload: budgetPayload,
            },
          });

          // Call ORDS endpoint
          const endpoint = isNew
            ? 'PAM/postPmispamBudgetlinecostProcess'
            : 'PAM/postPmispamBudgetlinecostProcess';

          const budgetResponse = await Actions.callRest(context, {
            endpoint: endpoint,
            headers: {
              'x-session-id': encryptedKey,
              'x-session-code': method,
            },
            body: {
              payload: encryptedPayload,
            },
          });

          if (budgetResponse.body.p_err_code === 'S') {
            console.log(`✅ Budget line ${isNew ? 'created' : 'updated'} successfully`);
          } else {
            console.error(`❌ Budget line ${isNew ? 'create' : 'update'} failed:`, budgetResponse.body.p_err_msg);
          }

        } catch (budgetError) {
          console.error("❌ Error saving budget line:", budgetError);
          // Continue with other lines
        }
      }

      console.log("✅ Budget lines save process completed");
    }

    // ========== HELPER: Reload Page Data ==========
    async reloadPageData(context) {
      const { $variables } = context;

      console.log("🔄 Reloading page data...");

      try {
        // Call vbAfterNavigateListener to reload all data
        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener',
        });

        console.log("✅ Page data reloaded successfully");

      } catch (reloadError) {
        console.error("⚠️ Error reloading page data:", reloadError);

        // Show warning but don't fail the save
        await Actions.fireNotificationEvent(context, {
          summary: 'Warning',
          message: 'Data saved but failed to reload. Please refresh the page.',
          type: 'warning',
          displayMode: 'transient',
        });
      }
    }
  }

  return saveMasterPlanAction;
});