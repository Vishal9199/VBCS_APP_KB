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

  class onDelete_OkAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/postPmispamProjectmasterplanProcess',
        headers: {
          'x-session-id': $variables.passDltObj.enc_key,
          'x-session-code': $variables.passDltObj.enc_method,
        },
        body: {
          payload: $variables.passDltObj.enc_payload,
        },
      });

      await Actions.fireNotificationEvent(context, {
        summary: response.body.P_ERR_MSG,
        displayMode: 'transient',
        type: response.body.P_ERR_CODE === 'S' ? 'confirmation' : 'error',
      });

      if (response.body.P_ERR_CODE === 'S') {
        const deleteDialogClose = await Actions.callComponentMethod(context, {
          selector: '#delete_dialog',
          method: 'close',
        });

        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });
      }
      
    }
  }

  return onDelete_OkAction;
});