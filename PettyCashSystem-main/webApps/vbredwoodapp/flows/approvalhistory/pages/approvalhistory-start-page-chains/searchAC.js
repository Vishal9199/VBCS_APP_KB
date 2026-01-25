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
        $variables.searchObj.P_APPR_REQUEST_CODE = $variables.lv_appr_request_code;
        $variables.searchObj.P_TRANSACTION_ID = $variables.lv_transaction_id;

        let temp_enc_payload = await $application.functions.encryptJs_Normal($application.constants.secretKey, $variables.searchObj);

        $variables.encrySearchObj.payload = temp_enc_payload;

        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postNws_custApprovalActionHistory',
          body: $variables.encrySearchObj,
        });

        if (response.body.OUT_COUNT >= 0) {

          $variables.adpSearch.data = response.body.P_OUTPUT;

          if (response.body.OUT_HAS_NEXT === 'N') {
            $variables.vHasMoreRecords = false;
          } else {
            $variables.vHasMoreRecords = true;
          }

          await Actions.fireDataProviderEvent(context, {
            target: $variables.adpSearch,
            refresh: null,
          });
        } else {
        }
      } catch (error) {
      }
    }
  }

  return searchAC;
});