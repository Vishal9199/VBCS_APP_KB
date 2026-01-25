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

  class loadChildTableAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.searchValueObj.LOOKUP_TYPE_ID = $variables.lookupTypeVar.lookup_type_id;
      $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchValueObj);

      const response = await Actions.callRest(context, {
        endpoint: 'Look_Up/postLookupValueSearch',
        body: $variables.encryptedBody,
      });

      $variables.ADPlookupValue.data = response.body.P_OUTPUT;

      $variables.pagination.prev = +$variables.searchValueObj.IN_OFFSET > 0;
      $variables.pagination.next = response.body.OUT_HAS_NEXT === "Y";

      
    }
  }

  return loadChildTableAC;
});
