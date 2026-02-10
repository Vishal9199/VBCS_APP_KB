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

  class vbEnterListener extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

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

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/postPmispamFiveyearplandtlSearch',
        body: encryptedPayload,
      });
      $variables.totalRecords = Number(response.body.OUT_TOTAL_COUNT) || 0;

      $variables.fiveYearPlanADP.data = response.body.P_OUTPUT;
      const offset = parseInt($variables.searchObj.in_offset, 10) || 0;
      const limit = parseInt($variables.searchObj.in_limit, 10) || 10;

      const totalCount = Number($variables.totalRecords || 0);

      if (totalCount > 0) {
        const startRecord = offset + 1;
        const endRecord = Math.min(offset + limit, totalCount);
        $variables.paginationDisplay = `(${startRecord}-${endRecord} of ${totalCount} items)`;
        console.log("+++++++1: ", $variables.paginationDisplay);
      } else {
        $variables.paginationDisplay = "(0-0 of 0 items)";
      }

      if (response.body.OUT_HAS_NEXT === 'Y') {
        $variables.hasNext = true;
      } else {
        $variables.hasNext = false;
      }

      if ($variables.searchObj.in_offset === '0') {
        $variables.hasPrev = false;
      } else {
        $variables.hasPrev = true;
      }

    }
  }

  return vbEnterListener;
});
