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

  class loadFypBudgetCostData extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {number} params.fyp_id
     * @param {number} params.fy_calendar_id
     * @param {number} params.project_id
     * @param {number} params.fy_id
     */
    async run(context, { fyp_id, fy_calendar_id, project_id, fy_id }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let enc_fyp_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: fy_id,
        },
      });

      let enc_project_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.postFypHdrVar.project_id,
        },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamFiveyearplandtlBudgetcostGetbyhdrid',
        headers: {
          'x-session-id': enc_fyp_id,
        },
      });

      if (response.ok && response.body.count > 0) {
        const fypBudgetData = response.body.items[0];

        $variables.postFypCostVar = {
          ...$variables.postFypCostVar,  // Keep existing year_prompt1-7
            fy_budget_cost_id: fypBudgetData.fy_budget_cost_id || null,
            fy_id: fypBudgetData.fy_id || fy_id,
            fy_plan_id: fypBudgetData.fy_plan_id || fyp_id,
            project_id: fypBudgetData.project_id || project_id,
            fy_calendar_id: fypBudgetData.budget_year_id || fy_calendar_id,
            year_value1: fypBudgetData.year_value1 || 0,
            year_value2: fypBudgetData.year_value2 || 0,
            year_value3: fypBudgetData.year_value3 || 0,
            year_value4: fypBudgetData.year_value4 || 0,
            year_value5: fypBudgetData.year_value5 || 0,
            additional_info: fypBudgetData.additional_info || '',
            created_by: fypBudgetData.created_by || null,
            created_date: fypBudgetData.creation_date || null,
            last_updated_by: fypBudgetData.last_updated_by || null,
            last_updated_date: fypBudgetData.last_update_date || null,
            last_updated_login: fypBudgetData.last_update_login || null,
            object_version_num: fypBudgetData.object_version_num || null,
          };
        
      } else {
              $variables.postFypCostVar = {
          ...$variables.postFypCostVar, 
            fy_budget_cost_id:  null,
            fy_plan_id: fyp_id,
            project_id : project_id,
            fy_calendar_id: fy_calendar_id,
            year_value1: 0,
            year_value2: 0,
            year_value3: 0,
            year_value4: 0,
            year_value5: 0,
            additional_info: '',
            object_version_num: null,
          };
      }
    }
  }

  return loadFypBudgetCostData;
});
