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

      $variables.searchUserObj.APPROVAL_ROLE_ID = $variables.approvalRoleVar.approval_role_id;
      $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchUserObj);

      const response = await Actions.callRest(context, {
        endpoint: 'ApprovalUserRole/postApproverRoleUserSearch',
        body: $variables.encryptedBody,
      });

      $variables.ADPapprovalRoleUser.data = response.body.P_OUTPUT;

      $variables.pagination.prev = +$variables.searchUserObj.IN_OFFSET > 0;
      $variables.pagination.next = response.body.OUT_HAS_NEXT === "Y";

    }
  }

  return loadChildTableAC;
});
