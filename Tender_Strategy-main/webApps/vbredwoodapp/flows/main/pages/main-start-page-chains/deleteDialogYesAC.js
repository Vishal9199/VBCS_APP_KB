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

  class deleteDialogYesAC extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $variables } = context;

      try {
        // Encrypt primary key
        const temp_key = await Actions.callChain(context, {
          chain: 'application:encryptLargePayloadWithTime',
          params: {
            plainText: $variables.passDeleteKey,
          },
        });

        // Encrypt HTTP method = DELETE
        const temp_method = await Actions.callChain(context, {
          chain: 'application:encryptLargePayloadWithTime',
          params: {
            plainText: 'DELETE',
          },
        });

        // Encrypt payload
        const temp_payload = await Actions.callChain(context, {
          chain: 'application:encryptLargePayloadWithTime',
          params: {
            plainText: JSON.stringify($variables.postPayloadVarVar),
          },
        });

        // Prepare encrypted payload
        $variables.encPayload.payload = temp_payload;

        // --- REST CALL ---
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postTenderStrategyProcess2',
          headers: {
            'X-session-id': temp_key,
            'X-session-code': temp_method,
          },
          body: $variables.encPayload,
        });

        const body = response?.body || {};

        // --- NOTIFICATION ---
        await Actions.fireNotificationEvent(context, {
          summary: body.P_ERR_MSG || 'Operation completed.',
          displayMode: 'transient',
          type: body.P_ERR_CODE === 'S' ? 'confirmation' : 'error',
        });

      } catch (err) {
        console.error('Error in deleteDialogYesAC:', err);

        // Error notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Something went wrong while deleting.',
          displayMode: 'transient',
          type: 'error',
        });

      } finally {
        // ALWAYS close dialog
        await Actions.callComponentMethod(context, {
          selector: '#delete_dialog',
          method: 'close',
        });
      }
    }
  }

  return deleteDialogYesAC;
});