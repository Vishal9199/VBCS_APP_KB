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

  class searchscheduleDetailsAction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
                try {
          const loadingDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'open',
          });
        } catch (dialogError) {
          console.log("ℹ️ Loading dialog not found, continuing without it");
        }

        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.searchObj,
          },
        });
        console.log("🔐 Encrypted payload created for schedule search");
        const encryptedPayload = {
          payload: enc_payload
        }

        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmispamConceptstudySearch',
          body: encryptedPayload,
        });

        console.log("📥 Project Search Response:");
console.log("   Status:", response.body.OUT_STATUS);
console.log("   Total Count:", response.body.OUT_TOTAL_COUNT);
console.log("   Current Count:", response.body.OUT_COUNT);
console.log("   Has Next:", response.body.OUT_HAS_NEXT);

        $variables.pamScheduleADP.data = response.body.P_OUTPUT || [];


        
        // ✅ Update pagination values
        $variables.totalRecords = response.body.OUT_TOTAL_COUNT || 0;
        
        const offset = parseInt($variables.searchObj.in_offset, 10) || 0;
        const limit = parseInt($variables.searchObj.in_limit, 10) || 10;
        $variables.currentPage = Math.floor(offset / limit) + 1;
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

        await Actions.fireDataProviderEvent(context, {
          target: $variables.pamScheduleADP,
          refresh: null,
        });
        
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

  return searchscheduleDetailsAction;
});
