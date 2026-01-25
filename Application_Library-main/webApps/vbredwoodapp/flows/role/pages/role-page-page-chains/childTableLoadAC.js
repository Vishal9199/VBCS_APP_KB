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

  class childTableOnLoadAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if($variables.P_METHOD === 'PUT'){

     $variables.isRoleCodeReadOnly = true;
      $variables.childSearch.P_ROLE_ID = $variables.P_PRIMARY_KEY;

      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.childSearch);

      $variables.encryptPayload.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'User/postAol_usrUserSearch',
        body: $variables.encryptPayload,
      });
      

      $variables.userADP.data = response.body.P_OUTPUT;
        $variables.pagination.prev = +$variables.childSearch.IN_OFFSET > 0;
        $variables.pagination.next = response.body.OUT_HAS_NEXT === "Y";
      } else {
        $variables.isRoleCodeReadOnly = false;
      }
    }
  }

  return childTableOnLoadAC;
});
