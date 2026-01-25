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

  class okDeleteAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let key = await Actions.callComponentMethod(context, {
        selector: '#deleteApprovalHierarchyListDialog',
        method: 'getProperty',
        params: [
          'primaryKey',
        ],
      });

      const headerCode = await $application.functions.encryptJs($application.constants.secretKey, 'DELETE');

      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, key);

      $variables.approvalHierarchyListVar.last_updated_by = $application.user.fullName;
      $variables.approvalHierarchyListVar.last_updated_date = await $application.functions.getSysdate();
      $variables.approvalHierarchyListVar.last_updated_login = $application.user.fullName;

      $variables.approvalHierarchyListVar.effective_start_date = await $application.functions.normalizeDate($variables.approvalHierarchyListVar.effective_start_date);
      $variables.approvalHierarchyListVar.effective_end_date = await $application.functions.normalizeDate($variables.approvalHierarchyListVar.effective_end_date);

      $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.approvalHierarchyListVar);

      const response = await Actions.callRest(context, {
        endpoint: 'approvalHeirarchy/postApprovalHierarchyListProcess',
        headers: {
          'X-cache-code': headerCode,
          'X-cache-id': encryptJs,
        },
        body: $variables.encryptedBody,
      });

      if (response?.body.P_ERR_CODE === "S") {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'confirmation',
        });

        $variables.searchHierarchyListObj.IN_OFFSET = 0;

        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
        });


        await Actions.resetVariables(context, {
          variables: [
            '$variables.approvalHierarchyListVar',
          ],
        });


      } else {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'persist',
          type: 'error',
        });
      }

      const deleteApprovalHierarchyListDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteApprovalHierarchyListDialog',
        method: 'close',
      });

    }
  }

  return okDeleteAC;
});
