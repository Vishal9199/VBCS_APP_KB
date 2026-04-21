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
     * @param {any}    params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $variables } = context;

      const enc_method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: 'DELETE' },
      });

      // Route to correct endpoint based on record type
      let endpoint;
      if ($variables.isCostOrRisk === 'Cost') {
        endpoint = 'PAM/postPmispamProjectcharterEstcostProcess';
      } else if ($variables.isCostOrRisk === 'Dependency') {
        endpoint = 'PAM/postPmispamProjectcharterDependencyProcess';
      } else {
        endpoint = 'PAM/postPmispamProjectcharterRiskProcess';
      }

      const response = await Actions.callRest(context, {
        endpoint: endpoint,
        headers: {
          'x-session-id':   $variables.passKey,
          'x-session-code': enc_method,
        },
        body: { payload: $variables.passPayload },
      });

      if (response.body.P_ERR_CODE === 'S') {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'confirmation',
        });

        await Actions.callComponentMethod(context, {
          selector: '#delete_dialog',
          method: 'close',
        });

        // Reload the correct table
        if ($variables.isCostOrRisk === 'Dependency') {
          await Actions.callChain(context, { chain: 'loadDependencies' });
        } else {
          await Actions.callChain(context, { chain: 'vbAfterNavigateListener' });
        }

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