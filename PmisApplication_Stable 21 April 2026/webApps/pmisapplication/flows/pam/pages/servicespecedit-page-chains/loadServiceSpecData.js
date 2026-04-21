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

  class loadServiceSpecData extends ActionChain {

    async run(context, { encryptedRegionId }) {
      const { $variables } = context;

      try {
        // Show progress
        // document.getElementById('progressMsg').open();

        const loadingDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'open',
        });

        // Call GET endpoint
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamServicespecGetbyid',
          headers: {
            'x-session-id': $variables.pNavId,
          },
        });        

        if(response.body.count >= 1) {
          $variables.serviceSpecVar = response.body.items[0];
          // Call toolbar action chain
          await Actions.callChain(context, {
            chain: 'toolBarAC',
            params: {
              taskId: $variables.taskId,
              statusCode: response.body.items[0].status_code,
            },
          });
        }
         else {
          // No encrypted ID - this is a new record scenario
          await Actions.callChain(context, {
            chain: 'toolBarAC',
            params: {
              statusCode: 'DRA',
            },
          });
          await Actions.fireNotificationEvent(context, {
            summary: 'Warning',
            message: 'Region record not found',
            type: 'warning',
            displayMode: 'transient'
          });
        }
        const loadingDialogClose = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });
      } catch (error) {
         const loadingDialogClose = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });
        console.error('loadRegionData error:', error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load service specification data: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return loadServiceSpecData;
});