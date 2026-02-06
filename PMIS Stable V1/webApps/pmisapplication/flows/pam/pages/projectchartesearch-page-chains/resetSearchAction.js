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

  class resetSearchAction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $variables } = context;

      try {
        // Reset all search parameters

        await $application.functions.clearAllFilterChips();
        
        await Actions.resetVariables(context, {
          variables: [
            '$variables.searchObj',
            '$variables.filterCriterion',
            // '$variables.currentOffset',
          ],
        });

        // // Clear table data
        // $variables.projectDetailsADP.data = [];
        // $variables.totalCount = 0;
        // $variables.currentCount = 0;
        // $variables.hasNext = 'N';

        // await Actions.fireNotificationEvent(context, {
        //   summary: 'Reset Complete',
        //   message: 'Search filters have been cleared',
        //   displayMode: 'transient',
        //   type: 'info',
        // });

      } catch (error) {
        console.error("Error in resetSearchAction:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to reset: ' + error.message,
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return resetSearchAction;
});