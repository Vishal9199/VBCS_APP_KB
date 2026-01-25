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

  class searchDataAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;
      

      const encryptJs = await $application.functions.encryptJs($flow.constants.secretKey, $variables.searchObj);

      $variables.encryptPayload.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'Function/postFunctionSearch',
        body: $variables.encryptPayload,
      });

      $variables.functionManagementADP.data = response.body.P_OUTPUT;

      $variables.pagingButton.previous =  + $variables.searchObj.IN_OFFSET>0;

      $variables.pagingButton.next =  response.body.OUT_HAS_NEXT === "Y";

         

    }
  }

  return searchDataAC;
});