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

  class deleteOkAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {string} params.deleteKey
     */
    async run(context, { event, originalEvent, deleteKey }) {
      const { $page, $flow, $application, $constants, $variables } = context;
      let temp_key;
      let temp_method;
      let temp_body;

      try {
        if (deleteKey != null) {

          temp_key = await Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: {
              plainText: $variables.postPettycashHeaderVar.claim_header_id,
            },
          });

          temp_method = await Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: {
              plainText: 'DELETE',
            },
          });

          temp_body = await Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: {
              plainText: JSON.stringify($variables.postPettycashHeaderVar),
            },
          });

          $variables.encPayload.payload = temp_body;

          const response = await Actions.callRest(context, {
            endpoint: 'ORDS/postPettycashHeaderProcess',
            headers: {
              'X-session-id': temp_key,
              'X-session-code': temp_method,
            },
            body: $variables.encPayload,
          });

          if (response.body.P_ERR_CODE === 'S') {
            const deleteDialogClose = await Actions.callComponentMethod(context, {
              selector: '#delete_dialog',
              method: 'close',
            });

            await Actions.callChain(context, {
              chain: 'vbAfterNavigateListener',
            });
          }

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: 'transient',
            type: response.body.P_ERR_CODE === 'S' ? 'confirmation' : 'error'
          });
        }
      } catch (error) {
      } finally {
      }
    }
  }

  return deleteOkAC;
});
