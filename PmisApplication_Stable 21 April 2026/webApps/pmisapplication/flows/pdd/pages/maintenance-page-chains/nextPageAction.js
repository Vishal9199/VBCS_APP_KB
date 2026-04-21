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
     * Navigate to next page of search results.
     * Triggered by Next button.
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables } = context;

      try {

        const currentOffset = parseInt($variables.searchObj.in_offset) || 0;
        const currentLimit  = parseInt($variables.searchObj.in_limit)  || 10;
        // vbEnterListener stores the flag in $variables.pagination.has_next
        if ($variables.pagination.has_next !== 'Y') {
          await Actions.fireNotificationEvent(context, {
            summary: 'You are already on the last page.',
            type: 'info',
            displayMode: 'transient',
          });
          return;
        }

        const newOffset = currentOffset + currentLimit;
        $variables.searchObj.in_offset = String(newOffset);

        await Actions.callChain(context, {
          chain: 'loadAC',
        });

      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Failed to load next page: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }
  }

  return nextPageAction;
});