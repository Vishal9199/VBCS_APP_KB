define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class onQcValueChange extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.event
     * @param {any} params.current
     * @param {number} params.index
     * @param {any} params.key
     * @param {any} params.updatedFrom
     * @param {any} params.value
     * @param {any} params.previousValue
     */
    async run(context, { event }) {
      const { $page } = context;

      // Only run if value actually changed
      if (event.detail.previousValue === event.detail.value) {
        return;
      }

      let totalMonth = Number($page.variables.qcCurrentRow.qc_total_month) || 0;
      let satisfiedMonth = Number($page.variables.qcCurrentRow.qc_satisfied_month) || 0;
      let failedMonth = Number($page.variables.qcCurrentRow.qc_failed_month) || 0;

      $page.variables.qcCurrentRow.qc_total_cumm = totalMonth;
      $page.variables.qcCurrentRow.qc_satisfied_cumm = satisfiedMonth;
      $page.variables.qcCurrentRow.qc_total_failed = failedMonth;

      let percent = 0;

      if (totalMonth > 0) {
        percent = (failedMonth / totalMonth) * 100;
      }

      $page.variables.qcCurrentRow.percent_failure = Math.round(percent * 100) / 100;
    }

  }

  return onQcValueChange;
});