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

      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchObj);

      $variables.encryptedBody.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'Application/postApplicationSearch',
        body: $variables.encryptedBody,
      });

      $variables.applicationRequestADP.data = response.body.P_OUTPUT;

      $variables.pagination.prev = +$variables.searchObj.IN_OFFSET > 0;

      $variables.pagination.next = response.body.OUT_HAS_NEXT === "Y";
    }
  }

  return searchAC;
});
