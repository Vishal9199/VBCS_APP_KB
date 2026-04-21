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
  class saveactionchain extends ActionChain {
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.contactpersononevalidation === 'valid' && $variables.contactpersontwovalidation === 'valid' && $variables.generalcontactvalidation === 'valid') {

        if ($variables.pNavCode === 'CREATE') {

          let enc_method = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: 'POST',
            },
          });

          let enc_key = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: '0',
            },
          });

          let enc_payload = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.contactDetailsVar,
            },
          });

          const response = await Actions.callRest(context, {
            endpoint: 'PDD/postPmispddContactProcess',
            headers: {
              'x-session-code': enc_method,
              'x-session-id': enc_key,
            },
            body: { payload: enc_payload },
          });

          if (response.body.P_ERR_CODE === 'S') {
            $variables.pNavEncId =
              response.headers.get('X-Session-Id') ||
              response.headers.get('x-session-id') ||
              response.headers.get('X-session-id');
            $variables.pNavCode = 'EDIT';
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

          let enc_put_method = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: 'PUT',
            },
          });

          let enc_payload = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.contactDetailsVar,
            },
          });

          let enc_p_key = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.pNavId,
            },
          });

          const response2 = await Actions.callRest(context, {
            endpoint: 'PDD/postPmispddContactProcess',
            headers: {
              'x-session-code': enc_put_method,
              'x-session-id': enc_p_key,
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
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please fix the mandatory fields',
          displayMode: 'persist',
          type: 'warning',
        });
      }
    }
  }
  return saveactionchain;
});