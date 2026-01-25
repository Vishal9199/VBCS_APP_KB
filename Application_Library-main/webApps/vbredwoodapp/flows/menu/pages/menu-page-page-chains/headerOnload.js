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

  class headerOnload extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.method === 'PUT') {
      

      $variables.searchObj.MENU_ID = $variables.primaryKey;

      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchObj);

      $variables.encryptedPayload.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'Menu/postMenuSearch',
        body: $variables.encryptedPayload,
      });

    
      

        $variables.menuVar = response.body.P_OUTPUT[0];
     

      await Actions.resetDirtyDataStatus(context, {
      });
      }
    }
  }

  return headerOnload;
});
