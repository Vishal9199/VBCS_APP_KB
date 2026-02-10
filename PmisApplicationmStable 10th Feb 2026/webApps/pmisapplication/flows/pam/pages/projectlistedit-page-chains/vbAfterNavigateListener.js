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
        } else {
          // ========== CREATE MODE ==========
          await this.loadCreateMode(context);
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

      // Step 1: Get Master Plan Header
      const headerResponse = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamMasterplanHeaderGetbyid',
        headers: {
          'x-session-id': $variables.pNavId,
        },
      });

      if (headerResponse.body.count !== 1) {
        throw new Error('Master Plan record not found');
      }

      const headerData = headerResponse.body.items[0];

      $variables.valueFromLov.regionCode = headerResponse.body.items[0].region_code;

      // Assign header data
      // $variables.masterPlanHeaderVar = headerData;

      //Destructuring
      const {
        project_id, object_version_num, mp_ref_id, mp_ref_num, mp_ref_plan_name, project_type_id,
        project_category_id, project_name, project_long_name, region_id, project_location_id,
        category_id, description, five_year_prj_flag, latest_est_budget_val, scp_approved_budget_val,
        active_flag, inactive_date, budget_year_id, comments, additional_info, created_by, created_date,
        last_updated_by, last_updated_date, last_updated_login
      } = headerResponse.body.items?.[0] || {};

      Object.assign($variables.masterPlanHeaderVar, {
        project_id, object_version_num, mp_ref_id, mp_ref_num, mp_ref_plan_name, project_type_id,
        project_category_id, project_name, project_long_name, region_id, project_location_id, 
        category_id, description, five_year_prj_flag, latest_est_budget_val, scp_approved_budget_val,
        active_flag, inactive_date, budget_year_id, comments, additional_info,
        created_by, created_date, last_updated_by, last_updated_date, last_updated_login
      });

      console.log(
        "%cMasterPlanHeaderVar assigned",
        "color:#2f9e44;font-weight:bold;",
        { ...$variables.masterPlanHeaderVar }
      );

      await Actions.fireDataProviderEvent(context, {
        refresh: null,
        target: $variables.getPmispamLovMasterplanLocationListSDP,
      });


      // Step 2: Refresh dependent Location LOV (if region selected)
      // if (headerData.region_id) {
      //   await this.refreshLocationLOV(context, headerData.region_id);
      // }

      // Step 3: Load Budget Cost Lines
      await this.loadBudgetLines(context, headerData.project_id);

      // Step 4: Load Calendar Year Ranges (if calendar selected)
      if (headerData.budget_year_id) {
        await Actions.callChain(context, {
          chain: 'loadCalendarYearRangesAC',
          params: { calendarId: headerData.budget_year_id },
        });
      }

      // Success notification
      // await Actions.fireNotificationEvent(context, {
      //   summary: 'Success',
      //   message: `Master Plan "${headerData.mp_ref_num}" loaded`,
      //   type: 'confirmation',
      //   displayMode: 'transient',
      // });
    }

    // ========== CREATE MODE LOGIC ==========
    async loadCreateMode(context) {
      const { $variables } = context;

      // Set create mode flag
      $variables.editMode = 'add';
      $variables.masterPlanHeaderVar.active_flag = 'Y';
      $variables.masterPlanHeaderVar.object_version_num = 0;

      // ========== PROJECT_CREATE SPECIFIC LOGIC - START ==========
      if ($variables.enterType === 'PROJECT_CREATE') {
        console.log("Entered in PROJECT_CREATE mode");
        if ($variables.inputProjectDtls.refNum) {
          $variables.masterPlanHeaderVar.mp_ref_num = $variables.inputProjectDtls.refNum;
        }
        if ($variables.inputProjectDtls.mpName) {
          $variables.masterPlanHeaderVar.mp_ref_plan_name = $variables.inputProjectDtls.mpName;
        }
        if ($variables.inputProjectDtls.mpRefId) {
          $variables.masterPlanHeaderVar.mp_ref_id = $variables.inputProjectDtls.mpRefId;
        }

        if ($variables.inputProjectDtls.budgetCal) {
          console.log("BUDGET_YEAR_ID: ", $variables.inputProjectDtls.budgetCal);
          $variables.masterPlanHeaderVar.budget_year_id = $variables.inputProjectDtls.budgetCal;
          console.log("BUDGET_YEAR_ID: ", $variables.masterPlanHeaderVar.budget_year_id);
          await Actions.fireDataProviderEvent(context, {
            refresh: null,
            target: $variables.getPmispamLovMasterplanDepCalendarnameListSDP,
          });
        }
      }
// ========== PROJECT_CREATE SPECIFIC LOGIC - END ==========

      // Initialize header with defaults
      // $variables.masterPlanHeaderVar = {
      //   project_id: null,
      //   object_version_num: 1,
      //   mp_ref_num: '',
      //   mp_ref_plan_name: '',
      //   project_name: '',
      //   region_id: null,
      //   project_location_id: null,
      //   five_year_prj_flag: 'N',
      //   latest_est_budget_val: 0,
      //   scp_approved_budget_val: 0,
      //   active_flag: 'Y',
      //   budget_year_id: null,
      // };

      // Clear budget data
      // $variables.ADPbudgetCostLines.data = [];
      // $variables.calendarYearRangesADP.data = [];

      // Clear budget form variables
      // $variables.budgetCostLineVar = {
      //   year_value1: 0,
      //   year_value2: 0,
      //   year_value3: 0,
      //   year_value4: 0,
      //   year_value5: 0,
      //   year_value6: 0,
      //   year_value7: 0,
      // };

      // Clear dependent LOV helper
      // $variables.valueFromLov = { regionCode: null };

      // Info notification
      // await Actions.fireNotificationEvent(context, {
      //   summary: 'Create Mode',
      //   message: 'Ready to create new Master Plan',
      //   type: 'info',
      //   displayMode: 'transient',
      // });
    }

    // ========== HELPER: Refresh Location LOV ==========
    // async refreshLocationLOV(context, regionId) {
    //   const { $variables } = context;

    //   const regionLovData = $variables.getPmisLovRegionNameListSDP;
      
    //   if (regionLovData?.data) {
    //     const regionItem = await regionLovData.data.find(
    //       item => item.lookup_value_id === regionId
    //     );
        
    //     if (regionItem) {
    //       // Set region code for dependent LOV
    //       $variables.valueFromLov.regionCode = regionItem.lookup_value_code;

    //       // Refresh Location LOV
    //       await Actions.fireDataProviderEvent(context, {
    //         target: $variables.getPmispamLovMasterplanLocationListSDP,
    //         refresh: null,
    //       });
    //     }
    //   }
    // }

    // ========== HELPER: Load Budget Lines ==========
    async loadBudgetLines(context, projectId) {
      const { $variables } = context;

      try {
        // let temp_key = await Actions.callChain(context, {
        //   chain: 'application:encryptAC',
        // });

        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamMasterplanLinebudgetcostGetbyid',
          headers: {
            'x-session-id': $variables.pNavId,
          },
        });

        $variables.ADPbudgetCostLines.data = response.body.count > 0 ? response.body.items : [];

      } catch (error) {
        // Budget lines may not exist yet - clear the array
        $variables.ADPbudgetCostLines.data = [];
      }
    }
  }

  return vbAfterNavigateListener;
});