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

  class nextBtnAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Parse current values
        const currentOffset = parseInt($variables.searchObj.in_offset, 10) || 0;
        const limit = parseInt($variables.searchObj.in_limit, 10) || 10;
        const totalRecords = $variables.totalRecords || 0;

        // Calculate new offset (go forward one page)
        let newOffset = currentOffset + limit;

        // ✅ VALIDATION: Ensure offset doesn't exceed total records
        if (newOffset >= totalRecords) {
          newOffset = Math.max(0, totalRecords - limit);
        }

        // Update offset as string (VBCS expects string)
        $variables.searchObj.in_offset = String(newOffset);

        // Calculate current page
        $variables.currentPage = Math.floor(newOffset / limit) + 1;

        console.log("➡️ Next Button Clicked");
        console.log("📄 New Page:", $variables.currentPage);
        console.log("🔢 New Offset:", newOffset, "Limit:", limit);
        console.log("📊 Total Records:", totalRecords);

        // Reload data
        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener',
        });

      } catch (error) {
        console.error("❌ Error in nextBtnAC:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Pagination Error',
          message: 'Failed to navigate to next page: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return nextBtnAC;
});