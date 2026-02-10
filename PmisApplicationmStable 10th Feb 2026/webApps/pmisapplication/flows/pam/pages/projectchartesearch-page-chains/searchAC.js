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

  class searchAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Open loading dialog (if you have one)
        try {
          const loadingDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'open',
          });
        } catch (dialogError) {
          console.log("ℹ️ Loading dialog not found, continuing without it");
        }

        console.log("🔍 Searching project charters with parameters:");
        console.log("   Offset:", $variables.searchObj.in_offset);
        console.log("   Limit:", $variables.searchObj.in_limit);
        console.log(JSON.stringify($variables.searchObj, null, 2));

        // Encrypt the search payload
        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.searchObj,
          },
        });

        console.log("🔐 Encrypted payload created for project search");

        // Prepare encrypted payload object
        const encryptedPayload = {
          payload: enc_payload
        };

        // Call the Project Master Plan search endpoint
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmisProjectCharterSearch', // Update to your actual endpoint
          body: encryptedPayload,
        });

        console.log("📥 Project Charter Search Response:");
        console.log("   Status:", response.body.OUT_STATUS);
        console.log("   Total Count:", response.body.OUT_TOTAL_COUNT);
        console.log("   Current Count:", response.body.OUT_COUNT);
        console.log("   Has Next:", response.body.OUT_HAS_NEXT);

        // Update project table data
        $variables.projectCharterADP.data = response.body.P_OUTPUT || [];

        // ✅ Update pagination values
        $variables.totalRecords = response.body.OUT_TOTAL_COUNT || 0;
        
        const offset = parseInt($variables.searchObj.in_offset, 10) || 0;
        const limit = parseInt($variables.searchObj.in_limit, 10) || 10;
        $variables.currentPage = Math.floor(offset / limit) + 1;

        // ----------------------------
      // ✅ PAGINATION DISPLAY LOGIC
      // ----------------------------
      const totalCount = Number($variables.totalRecords || 0);

      if (totalCount > 0) {
        const startRecord = offset + 1;
        const endRecord = Math.min(offset + limit, totalCount);
        $variables.paginationDisplay = `(${startRecord}-${endRecord} of ${totalCount} items)`;
      } else {
        $variables.paginationDisplay = "(0-0 of 0 items)";
      }

        // ✅ Update pagination controls
        if (!$variables.pagination) {
          $variables.pagination = {
            is_next: false,
            is_prev: false
          };
        }

        // Disable Next button if no more pages
        if (response.body.OUT_HAS_NEXT === 'Y') {
          $variables.pagination.is_next = false; // Enable Next button
        } else {
          $variables.pagination.is_next = true;  // Disable Next button
        }

        // Disable Previous button if on first page
        if (offset <= 0) {
          $variables.pagination.is_prev = true;  // Disable Previous button
        } else {
          $variables.pagination.is_prev = false; // Enable Previous button
        }

        console.log("✅ Pagination updated:");
        console.log("   Current Page:", $variables.currentPage);
        console.log("   Total Records:", $variables.totalRecords);
        console.log("   Previous disabled:", $variables.pagination.is_prev);
        console.log("   Next disabled:", $variables.pagination.is_next);

        // Refresh the project table data provider
        await Actions.fireDataProviderEvent(context, {
          target: $variables.projectCharterADP,
          refresh: null,
        });

        // Close loading dialog
        try {
          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } catch (dialogError) {
          console.log("ℹ️ Loading dialog close not needed");
        }

      } catch (error) {
        console.error("❌ Error in searchProjectDetailsAction:", error);
        
        // Close loading dialog on error
        try {
          const loadingDialogClose2 = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } catch (dialogError) {
          // Ignore dialog errors
        }
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Search Error',
          message: 'Failed to search projects: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return searchAC;
});