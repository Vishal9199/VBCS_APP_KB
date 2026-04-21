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
      $variables.lookupTypeVar.application_id = 25;

      $variables.searchObj.P_LOOKUP_TYPE_ID = $variables.key;

      $variables.encryptedBody.payload = await $application.functions.encryptJs2($application.constants.secretKey, $variables.searchObj);

      const response = await Actions.callRest(context, {
        endpoint: 'AOL/postLookupTypeSearch',
        body: $variables.encryptedBody,
      });

      if (response?.body?.OUT_COUNT === 1) {
        $variables.lookupTypeVar = response.body.P_OUTPUT[0];
        await Actions.resetDirtyDataStatus(context, {
        });
        
      }

      $variables.lookupTypeVar.dependent_lookup_type_id = Number(response.body.P_OUTPUT[0].dependent_lookup_type_id);
    }
  }

  return loadHeaderAC;
});