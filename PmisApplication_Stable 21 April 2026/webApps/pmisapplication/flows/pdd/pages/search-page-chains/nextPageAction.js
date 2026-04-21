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

  class nextPageAction extends ActionChain {

    /**
     * Navigate to next page of search results
     * Triggered by Next button
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables } = context;

      try {
        console.log("➡️ Next Page Action Started");

        const currentOffset = parseInt($variables.searchObj.in_offset) || 0;
        const currentLimit = parseInt($variables.searchObj.in_limit) || 30;

        // ✅ Check if there's a next page
        if ($variables.hasNextPage === "N") {
          console.log("⚠️ Already on last page");
          await Actions.fireNotificationEvent(context, {
            summary: 'Last Page',
            message: 'You are already on the last page',
            type: 'info',
            displayMode: 'transient'
          });
          return;
        }

        // ✅ Calculate new offset
        const newOffset = currentOffset + currentLimit;
        $variables.searchObj.in_offset = String(newOffset);

        console.log(`📄 Moving to next page: offset ${newOffset}`);

        // ✅ Trigger search with new offset
        await Actions.callChain(context, {
          chain: 'searchAC',
        });

        console.log("✅ Next page loaded successfully");

      } catch (error) {
        console.error("❌ Next Page Error: ", error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Navigation Failed',
          message: 'Failed to load next page: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return nextPageAction;
});