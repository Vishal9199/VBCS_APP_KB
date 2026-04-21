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
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {

        // Parse current values
        const currentOffset = parseInt($variables.searchObj.in_offset, 10) || 0;
        const currentLimit  = parseInt($variables.searchObj.in_limit, 10)  || 10;

        // Guard: check if next page exists
        // is_next is TRUE when there is NO next page (OUT_HAS_NEXT !== 'Y')
        if ($variables.pagination.is_next === true) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Last Page',
            message: 'You are already on the last page.',
            type: 'info',
            displayMode: 'transient',
          });
          return;
        }

        // Calculate new offset (go forward one page)
        const newOffset = currentOffset + currentLimit;

        // Update offset as string (VBCS expects string)
        $variables.searchObj.in_offset = String(newOffset);

        // Calculate current page
        $variables.currentPage = Math.floor(newOffset / currentLimit) + 1;

        console.log(
          "%cNext Button(Offset): %s",
          "color:green; font-size: 24px; font-weight: bold;",
          $variables.searchObj.in_offset
        );
        console.log(
          "%cNext Button(Current Page): %s",
          "color:green; font-size: 24px; font-weight: bold;",
          $variables.currentPage
        );

        console.log("➡️ Next Button Clicked - Completion Search");
        console.log("📄 New Page:", $variables.currentPage);

        // Reload data
        await Actions.callChain(context, {
          chain: 'searchCompletionAction',
        });

      } catch (error) {
        console.error("❌ Error in nextPageAction (Completion Search):", error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Pagination Error',
          message: 'Failed to navigate to next page: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }
  }

  return nextPageAction;
});