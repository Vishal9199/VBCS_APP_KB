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

      if ($variables.P_METHOD=== 'PUT') {
      

        $variables.isRoleCodeReadOnly = true;

   

        $variables.searchObj.P_ROLE_ID = $variables.P_PRIMARY_KEY;

      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchObj);

      $variables.encryptPayload.payload = encryptJs;

      const response2 = await Actions.callRest(context, {
        endpoint: 'Role/postAol_usrRoleSearch',
        body: $variables.encryptPayload,
      });

        $variables.roleManagementVar = response2.body.P_OUTPUT[0];

    
      
     

      await Actions.resetDirtyDataStatus(context, {
      });
      }
    }
  }

  return headerOnload;
});
