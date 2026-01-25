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

  class createClaimDialog_OK_AC extends ActionChain {

    /**
     * Create Petty Cash Header (POST only)
     * ✅ CORRECTED: Uses response.headers.get() to read x-session-id
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log('=== PETTY CASH HEADER SAVE START (POST ONLY MODE) ===');

        // =====================================================================
        // VALIDATE FORM
        // =====================================================================
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

        // =====================================================================
        // SET AUDIT FIELDS
        // =====================================================================
        $variables.postPettycashHeaderVar.last_updated_by = $application.user.username;
        $variables.postPettycashHeaderVar.last_updated_login = $application.user.email;
        $variables.postPettycashHeaderVar.last_updated_date = $application.functions.getSysdate();

        // =====================================================================
        // INITIALIZE VALUES FOR POST (NEW RECORD)
        // =====================================================================
        $variables.postPettycashHeaderVar.claim_header_id = 0;
        $variables.postPettycashHeaderVar.receipt_amt = 0;
        $variables.postPettycashHeaderVar.receipt_count = 0;
        $variables.postPettycashHeaderVar.claim_amt = 0;
        $variables.postPettycashHeaderVar.line_count = 0;
        $variables.postPettycashHeaderVar.close_balance_amt = $variables.postPettycashHeaderVar.open_balance_amt || 0;
        $variables.postPettycashHeaderVar.cash_in_hand = 
          ($variables.postPettycashHeaderVar.open_balance_amt || 0) - 
          ($variables.postPettycashHeaderVar.staff_iou_amt || 0);

        console.log('📊 Initial values applied:');
        console.log('   open_balance_amt:', $variables.postPettycashHeaderVar.open_balance_amt);
        console.log('   staff_iou_amt:', $variables.postPettycashHeaderVar.staff_iou_amt);
        console.log('   cash_in_hand:', $variables.postPettycashHeaderVar.cash_in_hand);

        // =====================================================================
        // ENCRYPT REQUEST PARAMETERS
        // =====================================================================
        
        // Encrypt header id as '0' for POST (new record)
        const headerId = await Actions.callChain(context, {
          chain: 'application:encLargePayloadWithTime',
          params: { plainText: '0' },
        });

        // Encrypt POST method
        const p_method = await Actions.callChain(context, {
          chain: 'application:encLargePayloadWithTime',
          params: { plainText: 'POST' },
        });

        // Encrypt payload
        const temp_payload = await Actions.callChain(context, {
          chain: 'application:encLargePayloadWithTime',
          params: { plainText: JSON.stringify($variables.postPettycashHeaderVar) },
        });

        $variables.encPayload.payload = temp_payload;

        console.log('📡 Calling ORDS endpoint (POST MODE)');
        console.log('📤 Request Headers:', {
          'X-session-id': headerId.substring(0, 20) + '...',
          'X-session-code': p_method.substring(0, 20) + '...'
        });

        // =====================================================================
        // CALL ORDS ENDPOINT
        // =====================================================================
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postPettycashHeaderProcess',
          headers: {
            'X-session-id': headerId,
            'X-session-code': p_method,
          },
          body: $variables.encPayload,
        });

        console.log('📥 Response Status:', response.status);
        console.log('📥 Response Body:', JSON.stringify(response.body));
        
        // =====================================================================
        // DEBUG: Check Headers Object Type
        // =====================================================================
        console.log('📥 Response Headers Type:', typeof response.headers);
        console.log('📥 Response Headers Constructor:', response.headers.constructor.name);
        console.log('📥 Is Headers Object:', response.headers instanceof Headers);

        // =====================================================================
        // HANDLE RESPONSE
        // =====================================================================
        if (response.body.P_ERR_CODE === 'S') {
          console.log('🎉 Save successful');

          // ===================================================================
          // ✅ CRITICAL FIX: Use .get() method to read headers
          // ===================================================================
          
          // Try different header name variations
          const encryptedId = response.headers.get('x-session-id') ||
                             response.headers.get('X-session-id') ||
                             response.headers.get('X-Session-Id') ||
                             response.headers.get('X-SESSION-ID');
          
          console.log('🔍 Checking headers with .get() method:');
          console.log('   x-session-id:', response.headers.get('x-session-id'));
          console.log('   X-session-id:', response.headers.get('X-session-id'));
          console.log('   X-Session-Id:', response.headers.get('X-Session-Id'));
          console.log('   X-SESSION-ID:', response.headers.get('X-SESSION-ID'));
          
          console.log('🆔 Encrypted ID from header:', encryptedId);

          if (encryptedId) {
            // Store the encrypted ID directly (no decryption needed in this flow)
            $variables.p_nav_id = encryptedId;
            
            console.log('✅ Stored encrypted p_nav_id:', $variables.p_nav_id);
            console.log('✅ Ready to navigate to main-edit page');
            
          } else {
            console.error('❌ No encrypted ID found in response headers');
            console.error('❌ Available headers:', response.headers);
            
            // Try to list all available headers
            if (response.headers.forEach) {
              console.log('📋 All available headers:');
              response.headers.forEach((value, key) => {
                console.log(`   ${key}: ${value.substring(0, 50)}...`);
              });
            }
            
            await Actions.fireNotificationEvent(context, {
              summary: 'Warning: claim_header_id not received from server',
              message: 'Save was successful but ID not returned. Please refresh the page.',
              displayMode: 'persist',
              type: 'warning',
            });
          }

          // Close dialog
          await Actions.callComponentMethod(context, {
            selector: '#governorateDialog',
            method: 'close',
          });

          // Show success notification
          // await Actions.fireNotificationEvent(context, {
          //   summary: response.body.P_ERR_MSG || 'Save successful',
          //   displayMode: 'transient',
          //   type: 'confirmation',
          // });

          // Navigate to edit page with encrypted ID
          console.log('🚀 Navigating to main-edit with p_nav_id:', $variables.p_nav_id);
          
          await Actions.navigateToPage(context, {
            page: 'main-edit',
            params: {
              'pNavId': $variables.p_nav_id,
            },
          });

        } else {
          // ===================================================================
          // ERROR RESPONSE
          // ===================================================================
          console.error('❌ Save failed:', response.body.P_ERR_MSG);

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Save failed',
            displayMode: 'transient',
            type: 'error',
          });
        }

        console.log('=== PETTY CASH HEADER SAVE END ===');

      } catch (error) {
        console.error('❌ Exception in createClaimDialog_OK_AC:', error);
        console.error('❌ Error stack:', error.stack);

        await Actions.fireNotificationEvent(context, {
          summary: 'An error occurred while saving',
          message: error.message,
          displayMode: 'persist',
          type: 'error',
        });
      }
    }
  }

  return createClaimDialog_OK_AC;
});