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
        endpoint: 'Program/postProgramLovSearch',
        body: $variables.encryptedBody,
      });

      $variables.lovConfigurationADP.data = response.body.P_OUTPUT;

      $variables.pagination.prev = +$variables.searchObj.in_offset > 0;

      $variables.pagination.next = response.body.OUT_HAS_NEXT === "Y";
    }
  }

  return searchAC;
});
