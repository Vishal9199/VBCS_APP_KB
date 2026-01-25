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
        console.log('=== PETTY CASH HEADER UPDATE START ===');

        // Validate form
        if ($variables.headerFormValid !== 'valid') {
          await Actions.fireNotificationEvent(context, {
            summary: 'Please fill valid details in the highlighted fields.',
            displayMode: 'transient',
            type: 'warning',
          });
          return;
        }

        // ===================================================================
        // Helper functions
        // ===================================================================
        const toString = (value) => {
          if (value === null || value === undefined) return null;
          return String(value);
        };

        // Format date as YYYY-MM-DD (simple format, no time)
        const formatForDateColumn = (dateValue) => {
          if (!dateValue) return null;
          const date = new Date(dateValue);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        // ===================================================================
        // Create payload matching your working format

        const response2 = await Actions.callRest(context, {
          endpoint: 'ORDS/getNws_custPettycashHeaderDtl',
          headers: {
            'x-session-id': $variables.pNavId,
          },
        });
        let new_ver_num = response2.body.items[0].object_version_num;
        // ===================================================================
        const cleanPayload = {
          // ✅ IDs as STRINGS
          claim_header_id: String($variables.payload.claim_header_id || 0),
          // object_version_num: String($variables.payload.object_version_num || 0),
          object_version_num: new_ver_num,
          
          // ✅ String fields
          claim_number: toString($variables.payload.claim_number),
          petty_cash_type: toString($variables.payload.petty_cash_type),
          governorate: toString($variables.payload.governorate),
          
          // ✅ Supplier fields as STRINGS
          supplier_id: String($variables.payload.supplier_id),
          supplier_name: toString($variables.payload.supplier_name),
          supplier_number: toString($variables.payload.supplier_number),
          supplier_site_id: String($variables.payload.supplier_site_id || 0),
          supplier_site_code: toString($variables.payload.supplier_site_code),
          
          // ✅ Status as LOOKUP CODE (not numeric ID)
          status_id: toString($variables.payload.status_code) || 'DRA',
          
          // ✅ Amounts as STRINGS
          open_balance_amt: String($variables.payload.open_balance_amt || 0),
          receipt_amt: String($variables.payload.receipt_amt || 0),
          claim_amt: String($variables.payload.claim_amt || 0),
          staff_iou_amt: String($variables.payload.staff_iou_amt || 0),
          close_balance_amt: String($variables.payload.close_balance_amt || 0),
          cash_in_hand: String($variables.payload.cash_in_hand || 0),
          
          // ✅ Other fields
          comments: toString($variables.payload.comments),
          
          // ✅ Integration fields as STRINGS
          saas_transaction_id: toString($variables.payload.saas_transaction_id),
          saas_transaction_number: toString($variables.payload.saas_transaction_number),
          integration_status_id: toString($variables.payload.integration_status_code) || 'DRA',
          integration_err_message: toString($variables.payload.integration_err_message),
          
          // ✅ Dates in simple format (YYYY-MM-DD)
          request_date: formatForDateColumn($variables.payload.request_date),
          created_date: formatForDateColumn($variables.payload.created_date),
          
          // ✅ Audit fields
          created_by: toString($variables.payload.created_by),
          last_updated_by: $application.user.username,
          last_updated_date: formatForDateColumn(new Date()),
          last_updated_login: $application.user.email
        };

        console.log('📦 Clean payload (string format):', JSON.stringify(cleanPayload, null, 2));

        // Encrypt
        // const headerId = await Actions.callChain(context, {
        //   chain: 'application:encLargePayloadWithTime',
        //   params: { plainText: $variables.pNavId },
        // });
        const headerId = $variables.pNavId ;

        const p_method = await Actions.callChain(context, {
          chain: 'application:encLargePayloadWithTime',
          params: { plainText: 'PUT' },
        });

        const temp_payload = await Actions.callChain(context, {
          chain: 'application:encLargePayloadWithTime',
          params: { plainText: JSON.stringify(cleanPayload) },
        });

        $variables.encPayload.payload = temp_payload;

        // Call backend
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postPettycashHeaderProcess',
          headers: {
            'X-session-id': headerId,
            'X-session-code': p_method,
          },
          body: $variables.encPayload,
        });

        console.log('📥 Response:', JSON.stringify(response.body));

        if (response.body.P_ERR_CODE === 'S') {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Update successful',
            displayMode: 'transient',
            type: 'confirmation',
          });

          await Actions.callChain(context, {
            chain: 'loadLineTablesAC',
            params: {
              'key_param': response2.body.items[0].claim_header_id,
            },
          });

        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'Update Failed',
            message: response.body.P_ERR_MSG,
            displayMode: 'persist',
            type: 'error',
          });
        }

      } catch (error) {
        console.error('❌ ERROR:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'An unexpected error occurred',
          message: error.message,
          displayMode: 'persist',
          type: 'error',
        });
      }
    }
  }

  return savePettyCashHeaderAC;
});