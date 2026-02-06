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

  class buildBudgetColumnsAC extends ActionChain {

    /**
     * @param {Object} context
     * Builds dynamic column configuration for budget entry table based on calendar year ranges
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log('Building budget table columns...');

        // Get year ranges from calendar
        const yearRanges = $variables.calendarYearRangesADP.data || [];
        console.log('Year ranges available:', yearRanges.length);

        // Build columns array
        const columns = [];

        // 1. Plan Name Column (Always first)
        columns.push({
          headerText: "Plan Name",
          field: "row_id",
          resizable: "enabled",
          sortable: "disabled",
          width: 150,
          template: "plan_name_template",
          headerStyle: "white-space: nowrap; min-width: 150px; background-color: #084c4c; color: white; font-weight: bold; text-align: center;"
        });

        // 2. Dynamic Year Range Columns (Based on calendar)
        for (let i = 0; i < yearRanges.length && i < 7; i++) {
          const yearRange = yearRanges[i];
          const yearIndex = i + 1;

          columns.push({
            headerText: yearRange.year_prompt || `Year ${yearIndex}`,
            field: `year_value${yearIndex}`,
            resizable: "enabled",
            sortable: "disabled",
            // width: 210,
            width: "",
            template: `year_value${yearIndex}_template`,
            headerStyle: "white-space: nowrap; min-width: 150px; background-color: #084c4c; color: white; font-weight: bold; text-align: center;"
          });
        }

        // Set the columns variable
        $variables.budgetEntryColumnsVar = columns;

        console.log('Budget table columns built successfully:', columns.length);
        console.log('Columns:', JSON.stringify(columns, null, 2));

      } catch (error) {
        console.error('Error building budget columns:', error);
        
        // Set default columns in case of error
        $variables.budgetEntryColumnsVar = [
          {
            headerText: "Plan Name",
            field: "row_id",
            resizable: "enabled",
            sortable: "disabled",
            width: 150,
            template: "plan_name_template",
            headerStyle: "white-space: nowrap; min-width: 150px; background-color: #084c4c; color: white; font-weight: bold;"
          }
        ];

        // Show error notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to build budget table columns. Please refresh the page.',
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return buildBudgetColumnsAC;
});