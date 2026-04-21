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

  class SelectValueItemChangeChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     * @param {any} params.key
     * @param {any} params.data
     * @param {any} params.metadata
     * @param {any} params.valueItem
     */
    async run(context, { event, previousValue, value, updatedFrom, key, data, metadata, valueItem }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (value !== null && value !== 'undefined') {
        $variables.fiveyearPlanvar.fy_plan_name = data.fy_plan_name;
        $variables.fiveyearPlanvar.master_plan_name = data.master_plan_name;
        $variables.fiveyearPlanvar.mp_calendar_id = data.mp_calendar_id;
        $variables.fiveyearPlanvar.fyp_calendar_name = data.fyp_calendar_name;
        $variables.fiveyearPlanvar.fy_calendar_id = data.fy_calendar_id;
      }
    }
  }

  return SelectValueItemChangeChain;
});
