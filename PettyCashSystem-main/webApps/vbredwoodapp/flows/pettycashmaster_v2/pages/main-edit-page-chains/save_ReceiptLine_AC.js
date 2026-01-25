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

  class save_ReceiptLine_AC extends ActionChain {

    constructor() {
      super();
      this._isSaving = false;
    }

    /**
     * Format date to YYYY-MM-DD
     */
    _formatDate(date) {
      if (!date) return null;
      const d = date instanceof Date ? date : new Date(String(date).split('T')[0]);
      return d.toISOString().split('T')[0];
    }

    /**
     * Auto-fill defaults (like claim line)
     */
    _autoFillDefaults(payload, $page) {
      const header = $page.variables.payload;

      // Auto-fill claim_header_id (CRITICAL!)
      if (!payload.claim_header_id) {
        payload.claim_header_id = header?.claim_header_id || $page.variables.p_nav_id;
      }

      // Default values
      payload.currency = payload.currency || 'OMR';
      payload.exchange_rate = Number(payload.exchange_rate) || 1;
      payload.exchange_rate_type = payload.exchange_rate_type || 'Corporate';

      // Auto-calculate amount in OMR
      payload.receipt_line_amount = payload.receipt_line_amount || 
        (Number(payload.amount) * Number(payload.exchange_rate));

      // Numeric conversions
      payload.amount = Number(payload.amount);
      payload.receipt_line_amount = Number(payload.receipt_line_amount);
      payload.object_version_num = Number(payload.object_version_num) || 0;

      console.log('✅ Auto-filled:', {
        claim_header_id: payload.claim_header_id,
        currency: payload.currency,
        amount: payload.amount
      });

      return payload;
    }

    /**
     * Build payload
     */
    _buildPayload(form, currentUser, $page) {
      const payload = { ...form };
      const isUpdate = payload.claim_receipt_id > 0;

      // Auto-fill defaults
      this._autoFillDefaults(payload, $page);

      // Format dates
      payload.payment_received_date = this._formatDate(payload.payment_received_date);
      payload.exchange_rate_date = this._formatDate(payload.exchange_rate_date);

      // Audit fields
      if (isUpdate) {
        payload.created_date = this._formatDate(payload.created_date);
        payload.last_updated_by = currentUser;
        payload.last_updated_login = currentUser;
        delete payload.last_updated_date;
      } else {
        payload.created_by = currentUser;
        payload.last_updated_by = currentUser;
        payload.last_updated_login = currentUser;
        delete payload.created_date;
        delete payload.last_updated_date;
      }

      // Clean read-only fields
      delete payload.claim_number;
      delete payload.supplier_name;
      delete payload.header_status_name;
      delete payload.request_date;

      return payload;
    }

    /**
     * Validate
     */
    _validate(payload) {
      const required = ['claim_header_id', 'mode_of_payment', 'payment_received_date', 
                       'currency', 'amount', 'brief_narration'];
      
      const missing = required.filter(f => !payload[f] || 
        (typeof payload[f] === 'string' && !payload[f].trim()));

      if (missing.length > 0) {
        throw new Error(`Missing: ${missing.join(', ')}`);
      }

      if (payload.amount <= 0) throw new Error('Amount must be > 0');

      const paymentDate = new Date(payload.payment_received_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (paymentDate > today) throw new Error('Payment date cannot be future');
    }

    /**
     * Main save
     */
    async run(context) {
      const { $page, $application, $variables } = context;

      if (this._isSaving) return;
      this._isSaving = true;

      try {
        // Validate form
        if ($variables.receiptFormValid !== 'valid') {
          const vg = document.getElementById("receipt-validation");
          if (vg?.valid === "invalidHidden") vg.showMessages();
          if (vg?.valid !== "valid") vg.focusOn("@firstInvalidShown");
          
          await Actions.fireNotificationEvent(context, {
            summary: "Please fix errors",
            type: "warning",
            displayMode: "transient"
          });
          return;
        }

        // Build & validate
        const payload = this._buildPayload(
          $variables.receiptLineForm,
          $application.user.username,
          $page
        );
        
        this._validate(payload);

        const isUpdate = payload.claim_receipt_id > 0;
        const method = isUpdate ? 'PUT' : 'POST';
        const payloadJson = JSON.stringify(payload);

        console.log(`📤 ${method}:`, { id: payload.claim_receipt_id, size: payloadJson.length });

        // Encrypt
        const [enc_key, enc_method, enc_body] = await Promise.all([
          Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: { plainText: String(payload.claim_receipt_id || 0) }
          }),
          Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: { plainText: method }
          }),
          Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: { plainText: payloadJson }
          })
        ]);

        // API call
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postPettycashReceiptProcess',
          headers: {
            'x-session-id': enc_key,
            'x-session-code': enc_method
          },
          body: { payload: enc_body }
        });

        // Handle response
        if (response.body.P_ERR_CODE === 'S') {
          await Actions.callComponentMethod(context, {
            selector: '#receiptCreateDialog',
            method: 'close'
          });

          await Promise.all([
            Actions.fireNotificationEvent(context, {
              summary: response.body.P_ERR_MSG || `Receipt ${isUpdate ? 'updated' : 'created'}`,
              type: 'confirmation',
              displayMode: 'transient'
            }),
            Actions.callChain(context, { chain: 'loadLineTablesAC' })
          ]);

          await Actions.callChain(context, { chain: 'reCalculate_HeaderAmounts_AC' });

          console.log(`✅ ${method} complete`);
        } else {
          throw new Error(response.body.P_ERR_MSG || 'Save failed');
        }

      } catch (error) {
        console.error('❌ Error:', error.message);
        
        await Actions.fireNotificationEvent(context, {
          summary: error.message || 'Save failed',
          type: 'error',
          displayMode: 'transient'
        });
      } finally {
        this._isSaving = false;
      }
    }
  }

  return save_ReceiptLine_AC;
});