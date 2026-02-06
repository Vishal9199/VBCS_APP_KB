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

  class refreshBtnAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables } = context;

      try {
        console.log("🔄 Refresh Button Clicked");

        // Reset to first page but keep filters
        $variables.searchObj.in_offset = '0';
        $variables.currentPage = 1;

        // Reload data with current filters
        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener',
        });

        console.log("✅ Data refreshed successfully");

      } catch (error) {
        console.error("❌ Error in refreshBtnAC:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Refresh Error',
          message: 'Failed to refresh data: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return refreshBtnAC;
});