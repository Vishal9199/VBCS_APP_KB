define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class cashExpectationonLoad extends ActionChain {

    async run(context) {
      const { $page } = context;

      try {
        try {
          await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'open',
          });
        } catch (e) {}

        // ✅ Build clean payload — only 6 fields
        const searchPayload = {
          in_limit:       $page.variables.searchObj.in_limit       || "10",
          in_offset:      $page.variables.searchObj.in_offset      || "0",
          p_project_id:   $page.variables.searchObj.p_project_id   || "",
          p_project_name: $page.variables.searchObj.p_project_name || "",
          p_year:         $page.variables.searchObj.p_year         || "",
          p_keyword:      $page.variables.searchObj.p_keyword      || "",
        };

        console.log("🔍 Search Payload ==> " + JSON.stringify(searchPayload));

        const enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: searchPayload },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddCashexpectationSearch',
          body: { payload: enc_payload },
        });

        $page.variables.cashExpADP.data = response.body.P_OUTPUT       || [];
        $page.variables.totalRecords    = response.body.OUT_TOTAL_COUNT || 0;

        const offset = parseInt($page.variables.searchObj.in_offset, 10) || 0;
        const limit  = parseInt($page.variables.searchObj.in_limit,  10) || 10;
        const total  = Number($page.variables.totalRecords || 0);

        $page.variables.currentPage = Math.floor(offset / limit) + 1;

        if (total > 0) {
          const start = offset + 1;
          const end   = Math.min(offset + limit, total);
          $page.variables.paginationDisplay = `(${start}-${end} of ${total} items)`;
        } else {
          $page.variables.paginationDisplay = "(0-0 of 0 items)";
        }

      } catch (error) {
        console.error("Error in cashExpectationonLoad:", error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Search Error: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      } finally {
        try {
          await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } catch (e) {}
      }
    }
  }

  return cashExpectationonLoad;
});