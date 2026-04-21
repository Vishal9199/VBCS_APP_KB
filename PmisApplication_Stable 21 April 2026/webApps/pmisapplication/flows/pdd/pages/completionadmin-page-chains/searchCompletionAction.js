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

  class searchCompletionAction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Open loading dialog
        try {
          await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'open',
          });
        } catch (dialogError) {
          console.log("i️ Loading dialog not found, continuing without it");
        }

        // Encrypt payload
        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.searchObj,
          },
        });
        console.log("🔐 Encrypted payload created for completion search");

        const encryptedPayload = {
          payload: enc_payload
        };

        // Call REST endpoint
        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddCompletionadminSearch',
          body: encryptedPayload,
        });

        console.log("📥 Completion Search Response:");
        console.log("   Status:", response.body.OUT_STATUS);
        console.log("   Total Count:", response.body.OUT_TOTAL_COUNT);
        console.log("   Current Count:", response.body.OUT_COUNT);
        console.log("   Has Next:", response.body.OUT_HAS_NEXT);

        // Set ADP data
        $variables.completionADP.data = response.body.P_OUTPUT || [];

        // Update total records
        $variables.totalRecords = response.body.OUT_TOTAL_COUNT || 0;

        // Update pagination display
        const offset = parseInt($variables.searchObj.in_offset, 10) || 0;
        const limit = parseInt($variables.searchObj.in_limit, 10) || 10;
        const totalCount = Number($variables.totalRecords || 0);

        if (totalCount > 0) {
          const startRecord = offset + 1;
          const endRecord = Math.min(offset + limit, totalCount);
          $variables.paginationDisplay = `(${startRecord}-${endRecord} of ${totalCount} items)`;
        } else {
          $variables.paginationDisplay = "(0-0 of 0 items)";
        }

        // Update next/prev controls
        if (!$variables.pagination) {
          $variables.pagination = { is_next: false, is_prev: false };
        }

        // Next button - disable if no more pages
        $variables.pagination.is_next = response.body.OUT_HAS_NEXT !== 'Y';

        // Prev button - disable if on first page
        $variables.pagination.is_prev = offset <= 0;

        // Fire refresh event
        await Actions.fireDataProviderEvent(context, {
          target: $variables.completionADP,
          refresh: null,
        });

        // Close loading dialog
        try {
          await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } catch (dialogError) {
          console.log("i️ Loading dialog close not needed");
        }

      } catch (error) {
        console.error("❌ Error in searchCompletionAction:", error);

        // Close loading dialog on error
        try {
          await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } catch (dialogError) {
          // Ignore dialog errors
        }

        await Actions.fireNotificationEvent(context, {
          summary: 'Search Error',
          message: 'Failed to search completion records: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return searchCompletionAction;
});