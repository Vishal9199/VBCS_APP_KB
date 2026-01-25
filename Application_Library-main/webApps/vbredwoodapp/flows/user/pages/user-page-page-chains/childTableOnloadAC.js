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

  class childTableOnloadAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $variables, $application } = context;



      await Actions.resetVariables(context, {
        variables: [
    '$variables.searchObj.P_USER_ACCESS_ID',
  ],
      });

      $variables.searchObj.P_USER_ID = $variables.userAccessDetailHeaderVar.user_id;

      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchObj);

      $variables.encryptPayload.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'User/postAol_usrUserSearch',
        body: $variables.encryptPayload,
      });

      $variables.ADPuserAccessDetails.data = response.body.P_OUTPUT;
        $variables.pagination.prev = +$variables.searchObj.IN_OFFSET > 0;
        $variables.pagination.next = response.body.OUT_HAS_NEXT === "Y";
    }
  }

  return childTableOnloadAC;
});
