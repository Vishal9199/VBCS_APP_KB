define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onConfirmDeleteAction extends ActionChain {
    async run(context, { event, originalEvent }) {
      const { $variables } = context;
      try {
        await Actions.callComponentMethod(context, { selector: '#delete_dialog', method: 'close' });
        await Actions.callComponentMethod(context, { selector: '#loadingDialog', method: 'open' });

        const enc_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.selectedKey,
          },
        });
        const enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: 'DELETE',
          },
        });
        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddProjectlistProcess',
          body: {
            payload: $variables.selectedrow,
          },
          headers: {
            'x-session-code': enc_method,
            'x-session-id': enc_key,
          },
        });

        const ok = response.body.P_ERR_CODE === 'S' || response.status === 200 || response.status === 204;
        await Actions.callComponentMethod(context, { selector: '#loadingDialog', method: 'close' });

        if (ok) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Success', message: response.body.P_ERR_MSG || 'Record deleted successfully.',
            type: 'confirmation', displayMode: 'transient'
          });
          await Actions.callChain(context, { chain: 'vbAfterNavigateListener' });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error', message: response.body.P_ERR_MSG || 'Delete failed.',
            type: 'error', displayMode: 'persist'
          });
        }
      } catch (err) {
        try { await Actions.callComponentMethod(context, { selector: '#loadingDialog', method: 'close' }); } catch(e) {}
        await Actions.fireNotificationEvent(context, {
          summary: 'Error', message: 'Delete operation failed: ' + err.message,
          type: 'error', displayMode: 'persist'
        });
      }
    }
  }

  return onConfirmDeleteAction;
});