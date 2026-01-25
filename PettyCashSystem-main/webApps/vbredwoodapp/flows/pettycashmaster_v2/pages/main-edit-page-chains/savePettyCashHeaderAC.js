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

  class savePettyCashHeaderAC extends ActionChain {

    async run(context) {
      const { $page, $application, $variables, $functions } = context;

      try {
        console.log('=== PETTY CASH HEADER SAVE START ===');

        // Set audit fields
        $variables.payload.last_updated_by = $application.user.username;
        $variables.payload.last_updated_login = $application.user.email;
        $variables.payload.last_updated_date = $application.functions.getSysdate();

        // Determine if this is CREATE or UPDATE
        const isUpdate = $variables.p_nav_id && 
                        $variables.p_nav_id !== '0' && 
                        $variables.p_nav_id !== null && 
                        $variables.p_nav_id !== 'undefined';

        // Compare payloads for UPDATE (skip save if no changes)
        if (isUpdate) {
          const comparePettyCashHeaderPayloads = await $functions.comparePettyCashHeaderPayloads(
            $variables.payload_view,
            $variables.payload
          );

          if (comparePettyCashHeaderPayloads === 'Y') {
            await Actions.fireNotificationEvent(context, {
              summary: 'No changes made.',
              type: 'info',
              displayMode: 'transient',
            });
            console.log('⏭️ Save skipped - no changes detected');
            return;
          }
          console.log('✅ Changes detected - proceeding with UPDATE');
        } else {
          console.log('✅ New record - proceeding with CREATE');
        }

        // Validate form
        if ($variables.headerFormValid !== 'valid') {
          await Actions.fireNotificationEvent(context, {
            summary: 'Please fill valid details in the highlighted fields.',
            displayMode: 'transient',
            type: 'warning',
          });
          console.error('❌ Form validation failed');
          return;
        }

        console.log('✅ Form validation passed');

        // Prepare variables
        let headerId;
        let p_method;
        let temp_payload;
        let methodType;

        if (isUpdate) {
          // UPDATE MODE (PUT)
          console.log(`🔄 UPDATE mode - claim_header_id: ${$variables.p_nav_id}`);
          methodType = 'PUT';

          headerId = await Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: { plainText: $variables.p_nav_id },
          });

          p_method = await Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: { plainText: 'PUT' },
          });

        } else {
          // CREATE MODE (POST)
          console.log('🆕 CREATE mode - New record');
          methodType = 'POST';

          // Initialize amounts to zero
          $variables.payload.receipt_amt = 0;
          $variables.payload.receipt_count = 0;
          $variables.payload.claim_amt = 0;
          $variables.payload.line_count = 0;
          $variables.payload.close_balance_amt = $variables.payload.open_balance_amt || 0;
          $variables.payload.cash_in_hand = 
            ($variables.payload.open_balance_amt || 0) - 
            ($variables.payload.staff_iou_amt || 0);

          console.log('📊 Initial amounts set to zero');

          headerId = await Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: { plainText: '0' },
          });

          p_method = await Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: { plainText: 'POST' },
          });
        }

        // Encrypt payload
        temp_payload = await Actions.callChain(context, {
          chain: 'application:encLargePayloadWithTime',
          params: { plainText: JSON.stringify($variables.payload) },
        });

        $variables.encPayload.payload = temp_payload;

        // Call ORDS endpoint
        console.log(`📡 Calling ORDS endpoint with method: ${methodType}`);

        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postPettycashHeaderProcess',
          headers: {
            'X-session-id': headerId,
            'X-session-code': p_method,
          },
          body: $variables.encPayload,
        });

        console.log('📥 Response Body:', JSON.stringify(response.body));
        console.log('📥 Response Headers:', JSON.stringify(response.headers));

        // Handle response
        if (response.body.P_ERR_CODE === 'S') {
          console.log('✅ Save successful');

          // ===================================================================
          // CRITICAL: Get claim_header_id from RESPONSE HEADER (not body)
          // ===================================================================
          if (methodType === 'POST') {
            
            // ✅ Get encrypted ID from response header
            const encryptedId = response.headers['x-session-id'] || 
                               response.headers['X-session-id'] ||
                               response.headers['X-Session-Id'];
            
            console.log('🆔 Encrypted ID from response header:', encryptedId);
            
            if (encryptedId) {

              const decryptedId = await Actions.callChain(context, {
                chain: 'application:dec_CentralisedSecurity',
                params: {
                  plainText: encryptedId,
                },
              });
              
              console.log('🔓 Decrypted claim_header_id:', decryptedId);
              
              // Store the decrypted ID
              $variables.p_nav_id = String(decryptedId);
              $variables.payload.claim_header_id = Number(decryptedId);
              $variables.payload_view = JSON.parse(JSON.stringify($variables.payload));
              
              console.log('✅ claim_header_id stored in $variables.p_nav_id');
              console.log('✅ claim_header_id stored in $variables.payload');
              console.log('✅ Original payload updated for comparison');
              console.log('✅ Next save will use PUT method');
              
            } else {
              console.error('❌ No encrypted ID found in response header');
              await Actions.fireNotificationEvent(context, {
                summary: 'Warning: claim_header_id not received from server',
                message: 'Save was successful but ID not returned. Please refresh the page.',
                displayMode: 'persist',
                type: 'warning',
              });
            }
            
          } else if (methodType === 'PUT') {
            // Update successful - update original payload for next comparison
            $variables.payload_view = JSON.parse(JSON.stringify($variables.payload));
            console.log('✅ Original payload updated for next comparison');
          }

          // Show success notification
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Save successful',
            displayMode: 'transient',
            type: 'confirmation',
          });

          // Reload line tables if updating
          if (isUpdate) {
            console.log('🔄 Reloading line tables...');
            await Actions.callChain(context, {
              chain: 'loadLineTablesAC'
            });
          }

        } else {
          // Error
          console.error('❌ Save failed:', response.body.P_ERR_MSG);

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Save failed',
            displayMode: 'transient',
            type: 'error',
          });
        }

        console.log('=== PETTY CASH HEADER SAVE END ===');

      } catch (error) {
        console.error('❌ Exception in savePettyCashHeaderAC:', error);

        await Actions.fireNotificationEvent(context, {
          summary: 'An error occurred while saving',
          message: error.message,
          displayMode: 'persist',
          type: 'error',
        });
      }
    }
  }

  return savePettyCashHeaderAC;
});