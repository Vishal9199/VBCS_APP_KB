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

  class onDeleteAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.passDltObj.enc_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: key,
        },
      });

      $variables.passDltObj.enc_method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'DELETE',
        },
      });

      $variables.passDltObj.enc_payload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: current.row,
        },
      });

      const deleteDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#delete_dialog',
        method: 'open',
      });

      // const response = await Actions.callRest(context, {
      //   endpoint: 'PAM/postPmispamProjectmasterplanProcess',
      //   headers: {
      //     'x-session-id': enc_key,
      //     'x-session-code': enc_method,
      //   },
      // });

      // await Actions.fireNotificationEvent(context, {
      //   summary: response.body.P_ERR_MSG,
      //   displayMode: response.body.P_ERR_CODE === 'S' ? 'transient' : 'error',
      //   type: 'info',
      // });
    }
  }

  return onDeleteAction;
});
