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

  class fypBudgetTableColumnsChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const yearRanges = $variables.calendarFiveYearrangesADP.data;

      let columns = [];

    // 2. Dynamic Year Range Columns (Based on calendar)
        for (let i = 0; i < yearRanges.length && i < 5; i++) {
          const yearRange = yearRanges[i];
          const yearIndex = i + 1;

          columns.push({
            headerText: yearRange.year || `Year ${yearIndex}`,
            field: `year_value${yearIndex}`,
            resizable: "enabled",
            sortable: "disabled",
            // width: 210,
            width: "",
            template: `year_value${yearIndex}_template`,
            headerStyle: "white-space: nowrap; min-width: 150px; background-color: #084c4c; color: white; font-weight: bold; text-align: center;"
          });
        }

      $variables.fypBugetColumnsVar = columns;

    }
  }

  return fypBudgetTableColumnsChain;
});
