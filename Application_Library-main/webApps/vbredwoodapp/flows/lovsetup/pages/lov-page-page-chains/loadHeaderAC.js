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

  class loadHeaderAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;
      

      $variables.searchObj.p_lov_config_id = $variables.key;


      $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchObj);
      

      const response = await Actions.callRest(context, {
        endpoint: 'Program/postProgramLovSearch',
        body: $variables.encryptedBody,
      });

      if (response?.body?.OUT_COUNT === 1) {
        $variables.lovConfigurationVar = response.body.P_OUTPUT[0];

        await Actions.resetDirtyDataStatus(context, {
          variables: [
    '$variables.lovConfigurationVar',
  ],
        });
        
      }
    }
  }

  return loadHeaderAC;
});
