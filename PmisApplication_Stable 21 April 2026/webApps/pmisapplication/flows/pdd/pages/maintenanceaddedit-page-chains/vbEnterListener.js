define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils'
], (
  ActionChain,
  Actions,
  ActionUtils
) => {
  'use strict';

  class vbEnterListener extends ActionChain {

    async run(context) {
      const { $page, $variables, $application } = context;

      try {
        // ================================================================
        const pNavCode = $page.variables.pNavCode;
        const pNavId = $page.variables.pNavId;
        // ================================================================
        if (pNavCode === 'EDIT') {

                try {

        const loadingDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'open',
        });

           let encryptedkey=  await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: pNavId,
              },
            });

            const response = await Actions.callRest(context, {
              endpoint: 'PDD/getPmispddMaintenanceadminGetbyid',
              headers: {
                'x-session-id': pNavId,
              },
            });

        if(response.body.count >= 1) {
          $variables.maintenanceadminSearchVar = response.body.items[0];
        }
         else {
        }
        const loadingDialogClose = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });

            await Actions.callChain(context, {
              chain: 'loadAttachmentAC',
            });
      } catch (error) {
         const loadingDialogClose = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load service specification data: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
          
        } else if (pNavCode === 'CREATE') {
          // CREATE MODE - Initialize empty form
          console.log('✓ CREATE MODE - New servive specification, empty form');
          
        } else {
          // Invalid pNavCode
          console.error('✗ Invalid pNavCode:', pNavCode);
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: 'Invalid navigation code. Expected CREATE or EDIT',
            type: 'error',
            displayMode: 'persist'
          });
        }

      } catch (error) {
        console.error('vbEnter error:', error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to initialize page: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return vbEnterListener;
});