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

  class vbAfterNavigateListener extends ActionChain {

    async run(context, { event }) {
      const { $page, $variables } = context;

      // Open progress dialog
      await Actions.callComponentMethod(context, {
        selector: '#progressMsg',
        method: 'open',
      });

      try {
        if ($variables.pNavCode === "EDIT") {
          // ========== EDIT MODE ==========
          await this.loadEditMode(context);

          await Actions.callChain(context, {
            chain: 'toolBarAC',
            params: {
              statusCode: $variables.projectCharterVar.status_code,
            },
          });
        } else {
          // ========== CREATE MODE ==========
          await this.loadCreateMode(context);

          await Actions.callChain(context, {
            chain: 'toolBarAC',
            params: {
              statusCode: 'DRA',
            },
          });
        }
      } catch (error) {
        console.error("Error loading page:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load page: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      } finally {
        // Close progress dialog
        await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'close',
        });
      }
    }

    // ========== EDIT MODE LOGIC ==========
    async loadEditMode(context) {
      const { $variables } = context;

      // Set edit mode flag
      $variables.editMode = 'edit';

      // Step 1: Get Project Charter Header
      const headerResponse = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamProjectcharterHdrGetbyid',
        headers: {
          'x-session-id': $variables.pNavId,
        },
      });

      if (headerResponse.body.count !== 1) {
        throw new Error('Project Charter record not found');
      }

      const headerData = headerResponse.body.items[0];
      // $variables.projectCharterVar.region_id = headerResponse.region_id;

      // Store region code for dependent LOV
      // $variables.valueFromLov.regionCode = headerResponse.body.items[0].region_code;

      // Destructuring and assign header data
      const {
        project_charter_id, object_version_num, project_id, project_charter_name, 
        project_category, ref_num, region_id, region_code, region_name, related_sons, 
        budget_number, principle_purpose, other_purpose, justification, main_feature, 
        oper_philosophy, capex_requirement, location_pl, service_req_obj, overview_project,
        project_owner, execution_director, design, construction, testing_commissioning,
        design_date, construction_date, testing_commissioning_date, tender_award,
        estimated_capex_cost, estimated_opex_cost, procurement_assumption, operating_principle,
        manager_status, wf_item_type, wf_item_key, status_id, status_code, status_name,
        additional_info, created_by, created_date, last_updated_by, last_updated_date, 
        last_updated_login
      } = headerResponse.body.items?.[0] || {};

      Object.assign($variables.projectCharterVar, {
        project_charter_id, object_version_num, project_id, project_charter_name,
        project_category, ref_num, region_id, region_code, region_name, related_sons,
        budget_number, principle_purpose, other_purpose, justification, main_feature,
        oper_philosophy, capex_requirement, location_pl, service_req_obj, overview_project,
        project_owner, execution_director, design, construction, testing_commissioning,
        design_date, construction_date, testing_commissioning_date, tender_award,
        estimated_capex_cost, estimated_opex_cost, procurement_assumption, operating_principle,
        manager_status, wf_item_type, wf_item_key, status_id, status_code, status_name,
        additional_info, created_by, created_date, last_updated_by, last_updated_date,
        last_updated_login
      });

      console.log(
        "%cProjectCharterVar assigned",
        "color:#2f9e44;font-weight:bold;",
        { ...$variables.projectCharterVar }
      );

      // Step 2: Refresh dependent LOV if needed
      // if (headerData.region_id) {
      //   await Actions.fireDataProviderEvent(context, {
      //     refresh: null,
      //     target: $variables.getPmispamLovProjectCharterLocationListSDP,
      //   });
      // }

      // Step 3: Load Estimate Cost Lines
      await this.loadEstimateCostLines(context, headerData.project_charter_id);

      // Step 4: Load Major Risk Lines
      await this.loadMajorRiskLines(context, headerData.project_charter_id);

      // Success notification (optional - can be commented out)
      // await Actions.fireNotificationEvent(context, {
      //   summary: 'Success',
      //   message: `Project Charter "${headerData.ref_num}" loaded`,
      //   type: 'confirmation',
      //   displayMode: 'transient',
      // });
    }

    // ========== CREATE MODE LOGIC ==========
    async loadCreateMode(context) {
      const { $variables } = context;

      // Set create mode flag
      $variables.editMode = 'add';
      $variables.projectCharterVar.object_version_num = 0;

      // Initialize header with defaults (if not coming from PROJECT_CREATE)
      // Most values will be null/empty, allowing user to fill them

      // Clear child table data
      $variables.ADPestimateCost.data = [];
      $variables.ADPmajorRisk.data = [];

      // Clear form variables
      $variables.estimateCostVar = {};
      $variables.majorRiskVar = {};

      // Clear dependent LOV helper
      // $variables.valueFromLov = { regionCode: null };

    }

    // ========== HELPER: Load Estimate Cost Lines ==========
    async loadEstimateCostLines(context, projectCharterId) {
      const { $variables } = context;

      try {
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamProjectcharterEstcostGetbyid',
          headers: {
            'x-session-id': $variables.pNavId,
          },
        });

        $variables.ADPestimateCost.data = response.body.count > 0 ? response.body.items : [];

        console.log(
          "%cEstimate Cost Lines loaded",
          "color:#1971c2;font-weight:bold;",
          $variables.ADPestimateCost.data
        );

      } catch (error) {
        // Estimate cost lines may not exist yet - clear the array
        $variables.ADPestimateCost.data = [];
        console.warn("No estimate cost lines found or error loading:", error);
      }
    }

    // ========== HELPER: Load Major Risk Lines ==========
    async loadMajorRiskLines(context, projectCharterId) {
      const { $variables } = context;

      try {
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamProjectcharterRiskGetbyid',
          headers: {
            'x-session-id': $variables.pNavId,
          },
        });

        $variables.ADPmajorRisk.data = response.body.count > 0 ? response.body.items : [];

        console.log(
          "%cMajor Risk Lines loaded",
          "color:#e03131;font-weight:bold;",
          $variables.ADPmajorRisk.data
        );

      } catch (error) {
        // Major risk lines may not exist yet - clear the array
        $variables.ADPmajorRisk.data = [];
        console.warn("No major risk lines found or error loading:", error);
      }
    }
  }

  return vbAfterNavigateListener;
});