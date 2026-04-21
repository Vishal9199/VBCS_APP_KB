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

  class typBudgetCostfetch extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const typcalendarId = $variables.postTypHdrVar.fy_calendar_id;
      const fy_plan_id = $variables.postTypHdrVar.fy_plan_id;

      let encrypt_cal_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: typcalendarId,
        },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamFiveyearplandtlBudgetcostYearprompts',
        headers: {
          'x-session-id': encrypt_cal_id,
        },
      });

      const yearRanges = response.body.items;

      if (yearRanges && yearRanges.length > 0) {
        $variables.calendarThreeYearrangesADP.data = yearRanges;

        const updates = {
          year_prompt1: yearRanges[0]?.year || '',
          year_prompt2: yearRanges[1]?.year || '',
          year_prompt3: yearRanges[2]?.year || '',
        };

        $variables.postTypCostVar = {
          ...$variables.postTypCostVar,
          ...updates
        };
      } else {
        $variables.calendarThreeYearrangesADP.data = [];

        await Actions.fireNotificationEvent(context, {
          summary: 'No three year plan configured assigned',
          displayMode: 'transient',
        });
      }

      if ($variables.calendarThreeYearrangesADP.data &&
        $variables.calendarThreeYearrangesADP.data.length > 0) {
        await Actions.callChain(context, {
          chain: 'typBudgetTableColumnsChain',
        });

        // FIX: parameter names must match loadTypBudgetCostData's destructured params:
        //   { fyp_id, fy_calendar_id, project_id, fy_id }
        await Actions.callChain(context, {
          chain: 'loadTypBudgetCostData',
          params: {
            'fy_calendar_id': typcalendarId,
            'fyp_id':         fy_plan_id,
            'project_id':     $variables.postTypHdrVar.project_id,
            'fy_id':          $variables.postTypHdrVar.fy_id,
          },
        });
      } else {
        $variables.typBugetColumnsVar = [];
      }
    }
  }

  return typBudgetCostfetch;
});