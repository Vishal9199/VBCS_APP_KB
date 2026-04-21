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

  class saveRegionData extends ActionChain {

    async run(context, { closeAfterSave }) {
      const { $page, $application, $variables } = context;

      try {
        document.getElementById('progressMsg').open();

        // ================================================================
        // STEP 2: DETERMINE CREATE OR EDIT MODE
        // ================================================================
        const pNavCode = $page.variables.pNavCode;
        const pNavId = $page.variables.pNavId;
        const isEditMode = (pNavCode === 'EDIT');
        const httpMethod = isEditMode ? 'PUT' : 'POST';
        const currentUser = $application.user.username || 'SYSTEM';

        console.log('='.repeat(80));
        console.log('SAVE OPERATION');
        console.log('pNavCode:', pNavCode);
        console.log('pNavId:', pNavId);
        console.log('Mode:', isEditMode ? 'EDIT (PUT)' : 'CREATE (POST)');
        console.log('User:', currentUser);
        console.log('='.repeat(80));

        // ================================================================
        // STEP 4: ENCRYPT PAYLOAD
        // ================================================================
        let encryptedPayloadResult = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.regionHeaderVar,
          },
        });

        console.log('✓ Payload encrypted');

        // ================================================================
        // STEP 5: ENCRYPT METHOD
        // ================================================================
        const encryptedMethodResult = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: httpMethod,
          },
        });

        console.log('✓ Method encrypted:', httpMethod);

        // ================================================================
        // STEP 6: ENCRYPT PRIMARY KEY
        // ================================================================
        let encryptedPrimaryKey;
        
        if (isEditMode) {
          encryptedPrimaryKey = pNavId;
          console.log('✓ EDIT mode - using pNavId as encrypted primary key');
        } else {
          const pkResult = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: '0',
            },
          });
          encryptedPrimaryKey = pkResult;
          console.log('✓ CREATE mode - primary key encrypted as "0"');
        }

        // ================================================================
        // STEP 7: CALL PROCESS_DATA ENDPOINT
        // ================================================================
        console.log('Calling process_data endpoint...');
        
        const response = await Actions.callRest(context, {
          endpoint: 'PmisSetup/postPmisRegionProcess',
          headers: {
            'x-session-code': encryptedMethodResult,
            'x-session-id': encryptedPrimaryKey,
          },
          body: {"payload": encryptedPayloadResult},
        });

        // ================================================================
        // STEP 8: HANDLE RESPONSE (FIXED - UPPERCASE KEYS)
        // ================================================================
        console.log('='.repeat(80));
        console.log('API RESPONSE - FULL DETAILS');
        console.log('Status:', response.status);
        console.log('Response Body:', JSON.stringify(response.body, null, 2));
        
        const sessionId = response.headers.get('x-session-id');
        console.log('Response Header - x-session-id:', sessionId);
        console.log('='.repeat(80));

        // ✅ CRITICAL FIX: Use UPPERCASE keys
        if (response.body.P_ERR_CODE === 'S') {
          console.log('✓ SUCCESS:', response.body.P_ERR_MSG);
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Success',
            message: response.body.P_ERR_MSG || (isEditMode ? 'Region updated successfully' : 'Region created successfully'),
            type: 'confirmation',
            displayMode: 'transient'
          });

          // ================================================================
          // CRITICAL: FOR CREATE MODE - SWITCH TO EDIT MODE
          // ================================================================
          if (!isEditMode) {
            console.log('='.repeat(80));
            console.log('CREATE SUCCESS - SWITCHING TO EDIT MODE');
            
            // Get encrypted region_id from response header
            const newEncryptedRegionId = sessionId;
            console.log('New encrypted region_id:', newEncryptedRegionId);
            
            $page.variables.pNavCode = 'EDIT';
            $page.variables.pNavId = newEncryptedRegionId;
            
            console.log('✓ pNavCode updated to: EDIT');
            console.log('✓ pNavId updated to:', newEncryptedRegionId);
            console.log('='.repeat(80));
          }

          if (closeAfterSave) {
            console.log('Closing page...');
            await Actions.navigateBack(context, {});
          } else {
            console.log('Reloading data...');
            const currentNavId = $page.variables.pNavId;
            if (currentNavId && currentNavId !== '0') {
              await Actions.callChain(context, {
                chain: 'loadRegionData',
                params: {
                  encryptedRegionId: currentNavId
                }
              });
            }
          }

          document.getElementById('progressMsg').close();
          return { success: true };

        } else {
          console.log('✗ ERROR:', response.body.P_ERR_MSG);
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: response.body.P_ERR_MSG || 'Failed to save region',
            type: 'error',
            displayMode: 'persist'
          });

          document.getElementById('progressMsg').close();
          return { success: false };
        }

      } catch (error) {
        document.getElementById('progressMsg').close();
        console.error('saveRegionData error:', error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Save operation failed: ' + error.message,
          type: 'error',
          displayMode: 'persist'
        });

        return { success: false };
      }
    }
  }

  return saveRegionData;
});