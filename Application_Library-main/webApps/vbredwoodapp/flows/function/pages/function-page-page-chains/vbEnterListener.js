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

      if ($variables.method === 'POST') {
      

      $variables.functionDetailsVar.active_flag = 'Y';}

      if ($variables.method === 'PUT') {
      

      $application.variables.showNavigation = false;

      $variables.searchObj.P_FUNCTION_ID = $variables.primaryKey;

      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchObj);

      $variables.encryptedPayload.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'Function/postFunctionSearch',
        body: $variables.encryptedPayload,
      });

      $variables.functionDetailsVar = response.body.P_OUTPUT[0];

      await $application.functions.updateSmartSearchPlaceHolder();
      }

      await Actions.resetDirtyDataStatus(context, {
      });
    }
  }

  return vbEnterListener;
});
