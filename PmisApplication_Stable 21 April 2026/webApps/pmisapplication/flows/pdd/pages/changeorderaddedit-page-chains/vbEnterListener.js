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

        const response2 = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
          headers: {
            'x-session-id': $variables.pTenderId,
          },
        });

        $variables.projectObj = response2.body.items[0];
        $variables.projectObj.ora_project_id = response2.body.items[0].project_id;

        // ================================================================
        // STEP 1: GET NAVIGATION PARAMETERS
        // ================================================================
        const pNavCode = $page.variables.pNavCode;
        const pNavId   = $page.variables.pNavId;

        console.log('='.repeat(80));
        console.log('PAGE INITIALIZATION');
        console.log('pNavCode:', pNavCode);
        console.log('pNavId:', pNavId);
        console.log('pNavId type:', typeof pNavId);
        console.log('pNavId length:', String(pNavId).length);
        console.log('='.repeat(80));

        // ================================================================
        // STEP 2: CHECK pNavCode TO DETERMINE MODE
        // ================================================================
        if (pNavCode === 'EDIT') {
          console.log('✓ EDIT MODE - Loading existing CR data...');

          try {
            const loadingDialogOpen = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'open',
            });

            // ✅ KEY FIX: Only encrypt if pNavId is a raw number (from list)
            // If it's already an encrypted string (from CREATE), use it directly
            // Encrypted strings are always long (50+ chars), raw IDs are short numbers
            let encryptedkey;
            const pNavIdStr = String(pNavId);
            if (pNavIdStr.length < 30) {
              // Raw number from list navigation - needs encryption
              console.log('🔐 Raw pNavId detected, encrypting...');
              encryptedkey = await Actions.callChain(context, {
                chain: 'application:encryptAC',
                params: { input: pNavId },
              });
              // ✅ Store encrypted value back so save uses it directly
              $variables.pNavId = encryptedkey;
            } else {
              // Already encrypted long string from CREATE response - use directly
              console.log('🔐 Encrypted pNavId detected, using directly');
              encryptedkey = pNavId;
            }

            // Call GET endpoint
            const response = await Actions.callRest(context, {
              endpoint: 'PDD/getPmispddChangeorderGetbyid',
              headers: {
                'x-session-id': encryptedkey,
              },
            });

            if (response.body.count >= 1) {
              $variables.crDetailVar = response.body.items[0];
            }

            const loadingDialogClose = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });

          } catch (error) {
            await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });
            console.error('loadCRData error:', error);

            await Actions.fireNotificationEvent(context, {
              summary: 'Error',
              message: 'Failed to load CR data: ' + error.message,
              type: 'error',
              displayMode: 'transient',
            });
          }

        } else if (pNavCode === 'CREATE') {
          console.log('✓ CREATE MODE - New CR, empty form');

        } else {
          console.error('✗ Invalid pNavCode:', pNavCode);

          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: 'Invalid navigation code. Expected CREATE or EDIT',
            type: 'error',
            displayMode: 'persist',
          });
        }

      } catch (error) {
        console.error('vbEnter error:', error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to initialize page: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }
  }

  return vbEnterListener;
});