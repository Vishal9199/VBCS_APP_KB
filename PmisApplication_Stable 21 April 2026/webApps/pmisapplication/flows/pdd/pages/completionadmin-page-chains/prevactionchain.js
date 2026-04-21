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
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {

        // Parse current values
        const currentOffset = parseInt($variables.searchObj.in_offset, 10) || 0;
        const limit = parseInt($variables.searchObj.in_limit, 10) || 10;

        // Guard: check if we're already on the first page
        if (currentOffset === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'First Page',
            message: 'You are already on the first page.',
            type: 'info',
            displayMode: 'transient',
          });
          return;
        }

        // Calculate new offset (go back one page)
        let newOffset = currentOffset - limit;

        // ✅ VALIDATION: Ensure offset doesn't go below 0
        if (newOffset < 0) {
          newOffset = 0;
        }

        // Update offset as string (VBCS expects string)
        $variables.searchObj.in_offset = String(newOffset);

        // Calculate current page
        $variables.currentPage = Math.floor(newOffset / limit) + 1;

        console.log(
          "%cPrev Button(Offset): %s",
          "color:orange; font-size: 24px; font-weight: bold;",
          $variables.searchObj.in_offset
        );
        console.log(
          "%cPrev Button(Current Page): %s",
          "color:orange; font-size: 24px; font-weight: bold;",
          $variables.currentPage
        );

        console.log("⬅️ Previous Button Clicked - Completion Search");
        console.log("📄 New Page:", $variables.currentPage);
        console.log("🔢 New Offset:", newOffset, "Limit:", limit);

        // Reload data
        await Actions.callChain(context, {
          chain: 'searchCompletionAction',
        });

      } catch (error) {
        console.error("❌ Error in prevPageAction (Completion Search):", error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Pagination Error',
          message: 'Failed to navigate to previous page: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }
  }

  return prevPageAction;
});