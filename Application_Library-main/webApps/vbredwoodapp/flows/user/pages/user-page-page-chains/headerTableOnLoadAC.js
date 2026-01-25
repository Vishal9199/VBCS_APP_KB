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

  class headerTableOnLoadAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.searchObj.USER_ID = $variables.P_KEY;

      let encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchObj);

      $variables.encryptPayload.payload = encryptJs;
      const response = await Actions.callRest(context, {
        endpoint: 'User/postAol_usrRoleUserAccessSearch',
        body: $variables.encryptPayload,
      });

      $variables.userAccessDetailHeaderVar = response.body.P_OUTPUT[0];
      
    }
  }

  return headerTableOnLoadAC;
});
