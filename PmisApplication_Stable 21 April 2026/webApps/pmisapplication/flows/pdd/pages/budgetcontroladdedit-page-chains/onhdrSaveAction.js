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

  class onhdrSaveAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.pNavCode === 'CREATE') {

        let enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'POST' },
        });

        let enc_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: '0' },
        });

        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.postBudgetHdrVar },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddBudgetcontrolhdrProcess',
          headers: {
            'x-session-code': enc_method,
            'x-session-id':   enc_key,
          },
          body: { payload: enc_payload },
        });

        if (response.body.P_ERR_CODE === 'S') {

          // Store encrypted header ID from response header
          $variables.pNavEncId = response.headers.get('X-Session-Id') ||
                                 response.headers.get('x-session-id') ||
                                 response.headers.get('X-session-id');

          $variables.pNavCode = 'EDIT';

          // ── RELOAD postBudgetHdrVar FROM GET ─────────────────────────
          // After POST the DB generates budget_control_header_id, but it is
          // only returned as the encrypted pNavEncId in the response header.
          // postBudgetHdrVar still holds the original POST payload where
          // budget_control_header_id = null. SynBudgetLinesAC uses
          // postBudgetHdrVar.budget_control_header_id in its search payload
          // body — if it is null the field is stripped during JSON serialization
          // and ORDS receives no header ID, returning all lines or none.
          // Fix: reload postBudgetHdrVar from GET using pNavEncId so that
          // budget_control_header_id is correctly set before any subsequent
          // chain (SynBudgetLinesAC, onClickEnterBudget, onClickSaveBudget)
          // reads it.
          const getResponse = await Actions.callRest(context, {
            endpoint: 'PDD/getPmispddBudgetcontrolGetbyhdrid',
            headers: {
              'x-session-id': $variables.pNavEncId,
            },
          });

          if (getResponse.body.items && getResponse.body.items.length > 0) {
            $variables.postBudgetHdrVar = getResponse.body.items[0];
          }
          // ─────────────────────────────────────────────────────────────

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            type: 'confirmation',
          });

        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            type: 'error',
          });
        }

      } else {

        // EDIT mode — pNavEncId (post-CREATE) or pNavId (direct EDIT nav)
        // Both are already encrypted — no re-encryption needed
        const enc_p_key = $variables.pNavEncId || $variables.pNavId;

        let enc_put_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'PUT' },
        });

        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.postBudgetHdrVar },
        });

        const response2 = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddBudgetcontrolhdrProcess',
          headers: {
            'x-session-code': enc_put_method,
            'x-session-id':   enc_p_key,
          },
          body: { payload: enc_payload },
        });

        if (response2.body.P_ERR_CODE === 'S') {
          await Actions.fireNotificationEvent(context, {
            summary: response2.body.P_ERR_MSG,
            type: 'confirmation',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response2.body.P_ERR_MSG,
            type: 'error',
          });
        }
      }
    }
  }

  return onhdrSaveAction;
});