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
          console.log("ℹ️ Loading dialog not found, continuing without it");
        }

        // Encrypt payload
        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.searchObj,
          },
        });

        const encryptedPayload = {
          payload: enc_payload
        };

        // Call REST endpoint
        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddMaintenanceadminSearch',
          body: encryptedPayload,
        });
        $variables.tableADP.data = response.body.P_OUTPUT;

        const totalCount = Number(response.body.OUT_TOTAL_COUNT || 0);
        const currentCount = Number(response.body.OUT_COUNT || 0);
        const hasNext = response.body.OUT_HAS_NEXT || 'N';
        const offset = parseInt($variables.searchObj.in_offset, 10) || 0;
        const limit = parseInt($variables.searchObj.in_limit, 10) || 10;

        // Update pagination object
        $variables.pagination.offset = offset;
        $variables.pagination.limit = limit;
        $variables.pagination.total_records = totalCount;
        $variables.pagination.has_next = hasNext;   // nextPageAction reads this
        $variables.pagination.current_page = Math.floor(offset / limit) + 1;

        // Update pagination display
        if (totalCount > 0) {
          const startRecord = offset + 1;
          const endRecord = Math.min(offset + currentCount, totalCount);
          $variables.paginationDisplay = `(${startRecord}-${endRecord} of ${totalCount} items)`;
        } else {
          $variables.paginationDisplay = '(0-0 of 0 items)';
        }

        // Update button disabled states
        $variables.pagination.is_next = hasNext !== 'Y'; // true = disabled
        $variables.pagination.is_prev = offset <= 0;     // true = disabled


        // Update total records
        $variables.totalRecords = response.body.OUT_TOTAL_COUNT || 0;

        // Disable both buttons during fetch
        $variables.pagination.is_prev = true;
        $variables.pagination.is_next = true;

        // Fire refresh event
        await Actions.fireDataProviderEvent(context, {
          target: $variables.tableADP,
          refresh: null,
        });

        // Close loading dialog
        try {
          await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } catch (dialogError) {
          console.log("ℹ️ Loading dialog close not needed");
        }

      } catch (error) {

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