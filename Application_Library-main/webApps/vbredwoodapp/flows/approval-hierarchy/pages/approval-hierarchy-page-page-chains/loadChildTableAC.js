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

      $variables.searchHierarchyListObj.HIERARCHY_ID = $variables.approvalHierarchyVar.hierarchy_id;
      $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchHierarchyListObj);

      const response = await Actions.callRest(context, {
        endpoint: 'approvalHeirarchy/postApprovalHierarchyListSearch',
        body: $variables.encryptedBody,
      });

      $variables.ADPapprovalHierarchyList.data = response.body.P_OUTPUT;

      $variables.pagination.prev = +$variables.searchHierarchyListObj.IN_OFFSET > 0;
      $variables.pagination.next = response.body.OUT_HAS_NEXT === "Y";

    }
  }

  return loadChildTableAC;
});
