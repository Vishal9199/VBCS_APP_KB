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
     * Main search action chain with encryption and pagination
     * UPDATED: Based on working project structure
     * Uses application:encryptAC chain and loading dialog
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // ✅ Step 1: Open loading dialog
        try {
          const loadingDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'open',
          });
        } catch (dialogError) {
          console.log("ℹ️ Loading dialog not found, continuing without it");
        }

        console.log("🔍 Searching project assignments with parameters:");
        console.log("   Offset:", $variables.searchObj.in_offset);
        console.log("   Limit:", $variables.searchObj.in_limit);
        console.log(JSON.stringify($variables.searchObj, null, 2));

        // ✅ Step 2: Disable pagination buttons during search
        if (!$variables.pagination) {
          $variables.pagination = {
            is_next: false,
            is_prev: false,
            current_page: 1,
            total_records: 0,
            has_next: "N",
            offset: 0,
            limit: 30
          };
        }
        $variables.pagination.is_prev = true;
        $variables.pagination.is_next = true;

        // ✅ Step 3: Encrypt the search payload using application chain
        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.searchObj,
          },
        });

        console.log("🔐 Encrypted payload created");

        // ✅ Step 4: Prepare encrypted payload object
        const encryptedPayload = {
          payload: enc_payload
        };

        // ✅ Step 5: Call REST endpoint
        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddSearchDtl',
          body: encryptedPayload,
        });

        console.log("📥 Project Assignment Search Response:");
        console.log("   Status:", response.body.OUT_STATUS);
        console.log("   Total Count:", response.body.OUT_TOTAL_COUNT);
        console.log("   Current Count:", response.body.OUT_COUNT);
        console.log("   Has Next:", response.body.OUT_HAS_NEXT);

        // ✅ Step 6: Check response status
        if (response.body.OUT_STATUS !== "SUCCESS") {
          throw new Error(response.body.OUT_DESCRIPTION || "Search failed");
        }

        // ✅ Step 7: Update table data
        $variables.projectAssignmentADP.data = response.body.P_OUTPUT || [];

        // ✅ Step 8: Calculate pagination values
        const totalCount = Number(response.body.OUT_TOTAL_COUNT || 0);
        const currentCount = Number(response.body.OUT_COUNT || 0);
        const hasNext = response.body.OUT_HAS_NEXT || "N";
        const offset = parseInt($variables.searchObj.in_offset, 10) || 0;
        const limit = parseInt($variables.searchObj.in_limit, 10) || 30;

        // ✅ Step 9: Update pagination object
        $variables.pagination.offset = offset;
        $variables.pagination.limit = limit;
        $variables.pagination.total_records = totalCount;
        $variables.pagination.has_next = hasNext;
        $variables.pagination.current_page = Math.floor(offset / limit) + 1;

        // ✅ Step 10: Update pagination display (format: "(1-30 of 150 items)")
        if (totalCount > 0) {
          const startRecord = offset + 1;
          const endRecord = Math.min(offset + currentCount, totalCount);
          $variables.paginationDisplay = `(${startRecord}-${endRecord} of ${totalCount} items)`;
        } else {
          $variables.paginationDisplay = "(0-0 of 0 items)";
        }

        console.log("📄 Pagination Display:", $variables.paginationDisplay);

        // ✅ Step 11: Update pagination button states
        // Disable Next button if no more pages
        if (hasNext === 'Y') {
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
        console.log("   Current Page:", $variables.pagination.current_page);
        console.log("   Total Records:", $variables.pagination.total_records);
        console.log("   Previous disabled:", $variables.pagination.is_prev);
        console.log("   Next disabled:", $variables.pagination.is_next);

        // ✅ Step 12: Refresh the table data provider
        await Actions.fireDataProviderEvent(context, {
          target: $variables.projectAssignmentADP,
          refresh: null,
        });

        // ✅ Step 13: Show success notification
        // await Actions.fireNotificationEvent(context, {
        //   summary: 'Search Complete',
        //   message: `Found ${totalCount} records`,
        //   type: 'confirmation',
        //   displayMode: 'transient'
        // });

        // ✅ Step 14: Close loading dialog
        try {
          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } catch (dialogError) {
          console.log("ℹ️ Loading dialog close not needed");
        }

        console.log("🎉 Search Completed Successfully");

      } catch (error) {
        console.error("❌ Error in searchAC:", error);

        // Reset data on error
        $variables.projectAssignmentADP.data = [];
        $variables.pagination.total_records = 0;
        $variables.pagination.current_page = 1;
        $variables.paginationDisplay = "(0-0 of 0 items)";
        $variables.pagination.is_prev = true;
        $variables.pagination.is_next = true;

        // Close loading dialog on error
        try {
          const loadingDialogClose2 = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } catch (dialogError) {
          // Ignore dialog errors
        }

        // Show error notification
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