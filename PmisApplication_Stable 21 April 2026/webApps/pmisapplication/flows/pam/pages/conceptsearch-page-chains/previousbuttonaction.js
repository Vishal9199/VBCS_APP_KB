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

  class previousbuttonaction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Parse current values
        const currentOffset = parseInt($variables.searchObj.in_offset, 10) || 0;
        const limit = parseInt($variables.searchObj.in_limit, 10) || 10;

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

        console.log("⬅️ Previous Button Clicked - Project Search");
        console.log("📄 New Page:", $variables.currentPage);
        console.log("🔢 New Offset:", newOffset, "Limit:", limit);

        // Reload project data
        await Actions.callChain(context, {
          chain: 'searchscheduleDetailsAction',
        });

      } catch (error) {
        console.error("❌ Error in prevBtnAC (Project Search):", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Pagination Error',
          message: 'Failed to navigate to previous page: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return previousbuttonaction;
});