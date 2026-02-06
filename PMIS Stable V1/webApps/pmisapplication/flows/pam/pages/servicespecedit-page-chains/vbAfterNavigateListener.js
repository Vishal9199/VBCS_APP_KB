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

  class vbAfterNavigateListener extends ActionChain {

    async run(context) {
      const { $page, $variables } = context;

      try {
        // ================================================================
        // STEP 1: GET NAVIGATION PARAMETERS
        // ================================================================
        const pNavCode = $page.variables.pNavCode;
        const pNavId = $page.variables.pNavId;

        console.log('='.repeat(80));
        console.log('PAGE INITIALIZATION');
        console.log('pNavCode:', pNavCode);
        console.log('pNavId:', pNavId);
        console.log('='.repeat(80));

        // ================================================================
        // STEP 2: CHECK pNavCode TO DETERMINE MODE
        // ================================================================
        if (pNavCode === 'EDIT') {
          // EDIT MODE - Load existing region data
          console.log('✓ EDIT MODE - Loading existing service specification data...');
          
          if (!pNavId || pNavId === '0') {
            // Error: EDIT mode requires valid pNavId
            await Actions.fireNotificationEvent(context, {
              summary: 'Error',
              message: 'Invalid navigation: EDIT mode requires ID',
              type: 'error',
              displayMode: 'persist'
            });
            return;
          }
          
          // Load region data using GET by ID
          await Actions.callChain(context, {
            chain: 'loadServiceSpecData',
            params: {
              encryptedRegionId: pNavId,
            },
          });
          
        } else if (pNavCode === 'CREATE') {
          // CREATE MODE - Initialize empty form
          console.log('✓ CREATE MODE - New servive specification, empty form');

          // No encrypted ID - this is a new record scenario
          await Actions.callChain(context, {
            chain: 'toolBarAC',
            params: {
              statusCode: 'DRA',
            },
          });
          
          await Actions.resetVariables(context, {
            variables: ['$variables.serviceSpecVar'],
          });
          
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

  return vbAfterNavigateListener;
});