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

  class onOkLine_DeleteAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let enc_method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'DELETE',
        },
      });

      const response = await Actions.callRest(context, {
        endpoint: $variables.isCostOrRisk === 'Cost' ? 'PAM/postPmispamProjectcharterEstcostProcess' : 'PAM/postPmispamProjectcharterRiskProcess',
        headers: {
          'x-session-id': $variables.passKey,
          'x-session-code': enc_method,
        },
        body: {
          payload: $variables.passPayload,
        },
      });

      if (response.body.P_ERR_CODE === 'S') {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'confirmation',
        });

        const deleteDialogClose = await Actions.callComponentMethod(context, {
          selector: '#delete_dialog',
          method: 'close',
        });

        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener',
        });
      } else {
         await Actions.fireNotificationEvent(context, {
           summary: response.body.P_ERR_MSG,
           displayMode: 'transient',
           type: 'error',
         });
      }

    }
  }

  return onOkLine_DeleteAction;
});