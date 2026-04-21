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

  /**
   * onYearChange_AC
   * Triggered by the Year LOV (oj-select-single) ojValueAction event.
   * Rebuilds the budget table columns with the newly selected year so that
   * column headers display "Jan-YYYY", "Feb-YYYY", etc.
   *
   * Wire this chain to the Year LOV event listener in the page JSON:
   *   "yearLovAction": { "chains": [{ "chain": "onYearChange_AC",
   *                       "parameters": { "selectedYear": "{{$event.detail.value}}" } }] }
   */
  class onYearChange_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {number} params.selectedYear  - year value from the LOV
     */
    async run(context, { selectedYear }) {
      const { $page, $variables } = context;

      // Store selected year in the header variable
      $variables.postBudgetHdrVar.year = selectedYear;

      // Rebuild columns with the chosen year
      await Actions.assignVariable(context, {
        variable: '$variables.lvBudgetTableColumns',
        value: $page.functions.buildBudgetColumns(selectedYear),
        auto: 'always',
        reset: 'empty',
      });

      console.log('Year changed to', selectedYear, '– columns rebuilt.');
    }
  }

  return onYearChange_AC;
});