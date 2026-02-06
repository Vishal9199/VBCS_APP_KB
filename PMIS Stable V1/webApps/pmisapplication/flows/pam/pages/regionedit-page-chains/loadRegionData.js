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

  class loadRegionData extends ActionChain {

    async run(context, { encryptedRegionId }) {
      const { $variables } = context;

      try {
        // Show progress
        document.getElementById('progressMsg').open();

        // Call GET endpoint
        const response = await Actions.callRest(context, {
          endpoint: 'PmisSetup/getPmisRegionDtl',
          headers: {
            'x-session-id': $variables.pNavId,
          },
        });        

        if(response.body.count >= 1) {
          $variables.regionHeaderVar = response.body.items[0];
        }
         else {
          await Actions.fireNotificationEvent(context, {
            summary: 'Warning',
            message: 'Region record not found',
            type: 'warning',
            displayMode: 'transient'
          });
        }
document.getElementById('progressMsg').close();
      } catch (error) {
        document.getElementById('progressMsg').close();
        console.error('loadRegionData error:', error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load region data: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return loadRegionData;
});