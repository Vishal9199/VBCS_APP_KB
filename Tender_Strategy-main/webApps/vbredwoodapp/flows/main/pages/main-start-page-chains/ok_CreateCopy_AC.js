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

  class ok_CreateCopy_AC extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $variables } = context;

      try {
        // --- REST CALL ---
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postTenderStrategyCopy',
          headers: {
            'X-session-id': $variables.currentRow_Key || '',
            'X-session-user-id': $variables.currentUser_Email || '',
          },
        });

        const body = response?.body || {};

        // --- NOTIFICATION ---
        await Actions.fireNotificationEvent(context, {
          summary: body.P_ERR_MSG || 'No message returned from server',
          displayMode: 'transient',
          type: body.P_ERR_CODE === 'S' ? 'confirmation' : 'error',
        });

        // --- CLOSE DIALOG ONLY ON SUCCESS ---
        if (body.P_ERR_CODE === 'S') {
          await Actions.callChain(context, {
            chain: 'vbAfterNavigateListener',
          });

          await Actions.callComponentMethod(context, {
            selector: '#copy_dialog',
            method: 'close',
          });
        }

      } catch (err) {
        console.error('Error in postTenderStrategyCopy:', err);

        // --- ERROR NOTIFICATION ---
        await Actions.fireNotificationEvent(context, {
          summary: 'Something went wrong while copying strategy.',
          displayMode: 'transient',
          type: 'error',
        });

        // --- ALWAYS CLOSE DIALOG ON ERROR ---
        await Actions.callComponentMethod(context, {
          selector: '#copy_dialog',
          method: 'close',
        });
      }
    }
  }

  return ok_CreateCopy_AC;
});