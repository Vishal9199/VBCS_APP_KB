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

  class resetAction extends ActionChain {

    /**
     * Reset all filters and return to initial search state
     * Triggered by Reset button
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables } = context;

      try {
        console.log("🔄 Reset Action Started");

        // ✅ Step 1: Reset searchObj to default values
        await Actions.resetVariables(context, {
          variables: [
            '$variables.searchObj',
            '$variables.filterCriterion'
          ],
        });

        // Ensure default pagination values
        $variables.searchObj.in_limit = "30";
        $variables.searchObj.in_offset = "0";

        console.log("✅ Search parameters reset to defaults");

        // ✅ Step 2: Clear Smart Search component
        // The filterCriterion reset above will clear the Smart Search UI

        // ✅ Step 3: Reset pagination variables
        $variables.currentPage = 1;
        $variables.totalRecords = 0;
        $variables.paginationText = "Showing 0 to 0 of 0 records";
        $variables.isPrevDisabled = true;
        $variables.isNextDisabled = true;

        // ✅ Step 4: Clear table data
        $variables.projectAssignmentADP.data = [];

        console.log("✅ Table and pagination reset");

        // ✅ Step 5: Trigger initial search (optional - remove if you want empty table)
        // Uncomment the lines below if you want to load all records on reset
        /*
        await Actions.callChain(context, {
          chain: 'searchAC',
        });
        */

        // ✅ Step 6: Show success notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Reset Complete',
          message: 'All filters have been cleared',
          type: 'confirmation',
          displayMode: 'transient'
        });

        console.log("🎉 Reset Completed Successfully");

      } catch (error) {
        console.error("❌ Reset Error: ", error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Reset Failed',
          message: 'Failed to reset filters: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return resetAction;
});