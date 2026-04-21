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

  class prevPageAction extends ActionChain {

    /**
     * Navigate to previous page of search results
     * Triggered by Previous button
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables } = context;

      try {

        const currentOffset = parseInt($variables.searchObj.in_offset) || 0;
        const currentLimit = parseInt($variables.searchObj.in_limit) || 30;

        // ✅ Check if we're already on first page
        if (currentOffset === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'First Page',
            message: 'You are already on the first page',
            type: 'info',
            displayMode: 'transient'
          });
          return;
        }

        // ✅ Calculate new offset
        const newOffset = Math.max(0, currentOffset - currentLimit);
        $variables.searchObj.in_offset = String(newOffset);

        await Actions.callChain(context, {
          chain: 'loadAC',
        });

      } catch (error) {

        await Actions.fireNotificationEvent(context, {
          summary: 'Navigation Failed',
          message: 'Failed to load previous page: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return prevPageAction;
});