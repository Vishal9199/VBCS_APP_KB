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

  class loadTypBudgetCostData extends ActionChain {

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

      let enc_fy_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: fy_id,
        },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamFiveyearplandtlBudgetcostGetbyhdrid',
        headers: {
          'x-session-id': enc_fy_id,
        },
      });

      if (response.ok && response.body.count > 0) {
        const budgetData = response.body.items[0];

        $variables.postTypCostVar = {
          ...$variables.postTypCostVar,
          fy_budget_cost_id:  budgetData.fy_budget_cost_id  || null,
          fy_id:              budgetData.fy_id               || fy_id,
          fy_plan_id:         budgetData.fy_plan_id          || fyp_id,
          project_id:         budgetData.project_id          || project_id,
          fy_calendar_id:     budgetData.budget_year_id      || fy_calendar_id,
          year_value1:        budgetData.year_value1         ?? 0,
          year_value2:        budgetData.year_value2         ?? 0,
          year_value3:        budgetData.year_value3         ?? 0,
          year_value4:        budgetData.year_value4         ?? 0,
          year_value5:        budgetData.year_value5         ?? 0,
          year_prompt1:       budgetData.year_prompt1        ?? null,
          year_prompt2:       budgetData.year_prompt2        ?? null,
          year_prompt3:       budgetData.year_prompt3        ?? null,
          year_prompt4:       budgetData.year_prompt4        ?? null,
          year_prompt5:       budgetData.year_prompt5        ?? null,
          additional_info:    budgetData.additional_info     || '',
          created_by:         budgetData.created_by          || null,
          created_date:       budgetData.creation_date       || null,
          last_updated_by:    budgetData.last_updated_by     || null,
          last_updated_date:  budgetData.last_update_date    || null,
          last_updated_login: budgetData.last_update_login   || null,
          object_version_num: budgetData.object_version_num ?? 0,
        };

      } else {
        $variables.postTypCostVar = {
          ...$variables.postTypCostVar,
          fy_budget_cost_id:  null,
          fy_id:              fy_id,
          fy_plan_id:         fyp_id,
          project_id:         project_id,
          fy_calendar_id:     fy_calendar_id,
          year_value1:        0,
          year_value2:        0,
          year_value3:        0,
          year_value4:        0,
          year_value5:        0,
          additional_info:    '',
          object_version_num: 0,
        };
      }
    }
  }

  return loadTypBudgetCostData;
});