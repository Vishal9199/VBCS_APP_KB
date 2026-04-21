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

  class onCiForMonthChange extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, previousValue, value, updatedFrom, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let monthVal = Number($page.variables.ciCurrentRow.mechanism_for_month) || 0;

      // Auto calculate cumulative
      let total = monthVal + 1;

      $variables.ciCurrentRow.mechanism_total_cumm = total;
    }
  }

  return onCiForMonthChange;
});