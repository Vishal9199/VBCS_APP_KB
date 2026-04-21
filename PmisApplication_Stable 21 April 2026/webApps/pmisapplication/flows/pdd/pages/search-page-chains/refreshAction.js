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

  class refreshAction extends ActionChain {

    /**
     * Refresh current page data without changing filters or pagination
     * Triggered by Refresh button
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables } = context;

      try {
        console.log("🔄 Refresh Action Started");
        console.log("📄 Current Page ==> " + $variables.currentPage);

        // ✅ Simply call searchAC to reload with current searchObj
        // This maintains all current filters and pagination settings
        await Actions.callChain(context, {
          chain: 'searchAC',
        });

        // ✅ Show success notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Data Refreshed',
          message: 'Current page data has been refreshed',
          type: 'confirmation',
          displayMode: 'transient'
        });

        console.log("✅ Refresh Completed Successfully");

      } catch (error) {
        console.error("❌ Refresh Error: ", error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Refresh Failed',
          message: 'Failed to refresh data: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return refreshAction;
});