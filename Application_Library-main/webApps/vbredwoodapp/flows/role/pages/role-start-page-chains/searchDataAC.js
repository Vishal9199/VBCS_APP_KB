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

  class searchMenuDataAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchObj);

      $variables.encryptPayload.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'Role/postAol_usrRoleSearch',
        body: $variables.encryptPayload,
      });

      $variables.roleManagementADP.data = response.body.P_OUTPUT;
          $variables.pagingButton.previous = +$variables.searchObj.IN_OFFSET > 0;

      $variables.pagingButton.next = response.body.OUT_HAS_NEXT === "Y";
    }
  }

  return searchMenuDataAC;
});