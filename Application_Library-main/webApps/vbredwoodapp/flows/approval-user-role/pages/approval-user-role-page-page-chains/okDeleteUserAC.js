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

  class okDeleteUserAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const key = await Actions.callComponentMethod(context, {
        selector: '#deleteApprovalRoleUserDialog',
        method: 'getProperty',
        params: [
          'primaryKey',
        ],
      });

      const headerCode = await $application.functions.encryptJs($application.constants.secretKey, 'DELETE');
      const headerId = await $application.functions.encryptJs($application.constants.secretKey, key);


      const response = await Actions.callRest(context, {
        endpoint: 'ApprovalUserRole/postApproverRoleUserProcess',
        headers: {
          'X-cache-code': headerCode,
          'X-cache-id': headerId,
        },
        body: $variables.encryptedBody,
      });

      if (response?.body.P_ERR_CODE === "S") {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'confirmation',
        });

        $variables.searchUserObj.IN_OFFSET = 0;


        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
        });

      } else {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'error',
        });
      }

      const deleteApprovalRoleUserDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteApprovalRoleUserDialog',
        method: 'close',
      });

    }
  }

  return okDeleteUserAC;
});
