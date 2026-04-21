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

  class ThreeYearSelectValueItemChangeChain extends ActionChain {

    async run(context, { event, previousValue, value, updatedFrom, key, data, metadata, valueItem }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const safeData = valueItem?.data || data;

      console.log("Safe Data: ", JSON.stringify(safeData));
      
      if (!safeData) return;

      if (value !== null && value !== undefined) {
        $variables.tempThreeyearPlanvar.fy_plan_id = safeData.fy_plan_id;
        $variables.tempThreeyearPlanvar.fy_plan_name = safeData.fy_plan_name;
        $variables.tempThreeyearPlanvar.master_plan_name = safeData.master_plan_name;
        $variables.tempThreeyearPlanvar.mp_calendar_id = safeData.mp_calendar_id;
        $variables.tempThreeyearPlanvar.fyp_calendar_name = safeData.fyp_calendar_name;
        $variables.tempThreeyearPlanvar.fy_calendar_id = safeData.fy_calendar_id;
      }
    }
  }

  return ThreeYearSelectValueItemChangeChain;
});