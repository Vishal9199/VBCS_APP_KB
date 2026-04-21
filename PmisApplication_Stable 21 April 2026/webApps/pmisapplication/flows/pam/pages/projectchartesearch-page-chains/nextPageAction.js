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

        $variables.searchObj.in_offset = String(
          parseInt($variables.searchObj.in_offset, 10) + parseInt($variables.searchObj.in_limit, 10)
        );
        // Parse current values
        const offset = parseInt($variables.searchObj.in_offset, 10);
        const limit = parseInt($variables.searchObj.in_limit, 10);
        // const totalRecords = $variables.totalRecords || 0;

        // Calculate new offset (go forward one page)
        // let newOffset = currentOffset + limit;

        // ✅ VALIDATION: Ensure offset doesn't exceed total records
        // if (newOffset >= totalRecords) {
        //   newOffset = Math.max(0, totalRecords - limit);
        // }

        // Update offset as string (VBCS expects string)
        // $variables.searchObj.in_offset = String(newOffset);

        // Calculate current page
        $variables.currentPage = Math.floor(offset / limit) + 1;

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

        console.log("➡️ Next Button Clicked - Project Search");
        console.log("📄 New Page:", $variables.currentPage);
        // console.log("🔢 New Offset:", newOffset, "Limit:", limit);
        // console.log("📊 Total Records:", totalRecords);

        // Reload project data
        await Actions.callChain(context, {
          chain: 'searchAC',
        });

      } catch (error) {
        console.error("❌ Error in nextBtnAC (Project Search):", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Pagination Error',
          message: 'Failed to navigate to next page: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return nextPageAction;
});