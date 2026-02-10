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

  class fypBudgetCostfetch extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const fypcalendarId = $variables.postFypHdrVar.fy_calendar_id;
      const fy_plan_id = $variables.postFypHdrVar.fy_plan_id;

     let encrypt_cal_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: fypcalendarId,
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
        $variables.calendarFiveYearrangesADP.data = yearRanges;

        const updates = {
            year_value1: yearRanges[0]?.year || '',
            year_value2: yearRanges[1]?.year || '',
            year_value3: yearRanges[2]?.year || '',
            year_value4: yearRanges[3]?.year || '',
            year_value5: yearRanges[4]?.year || '',
          };

        $variables.postFypCostVar = {
          ...$variables.postFypCostVar,
          ...updates
        };
      } else {
        $variables.calendarFiveYearrangesADP.data = [];

        await Actions.fireNotificationEvent(context, {
          summary: 'No five year plan configured assigned',
          displayMode: 'transient',
        });
      }

      if ($variables.calendarFiveYearrangesADP.data && 
      $variables.calendarFiveYearrangesADP.data.length > 0) {
        await Actions.callChain(context, {
          chain: 'fypBudgetTableColumnsChain',
        });

        await Actions.callChain(context, {
          chain: 'loadFypBudgetCostData',
          params: {
            'fy_calendar_id': fypcalendarId,
            'fyp_id': fy_plan_id,
            'project_id': $variables.postFypHdrVar.project_id,
            'fy_id': $variables.postFypHdrVar.fy_id,
          },
        });
      } else {

        $variables.fypBugetColumnsVar = [];
      }
    }
  }

  return fypBudgetCostfetch;
});
