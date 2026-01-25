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
    _formatDate(dateInput) {
      if (!dateInput) return null;
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput.split('T')[0]);
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    }

    /**
     * Build complete payload with auto-fill defaults
     */
    _buildPayload(formData, currentUser, header) {
      const payload = { ...formData };
      const isUpdate = payload.claim_receipt_id > 0;

      // Verify header ID
      if (!header?.claim_header_id) {
        throw new Error('Header data not loaded. Please refresh and try again.');
      }

      // Auto-fill required fields
      payload.claim_header_id = Number(header.claim_header_id);

      // Currency defaults
      payload.currency = payload.currency || 'OMR';
      payload.exchange_rate = Number(payload.exchange_rate) || 1;
      payload.exchange_rate_type = payload.exchange_rate_type || 'Corporate';
      payload.exchange_rate_date = payload.exchange_rate_date || new Date().toISOString();

      // Numeric conversions
      payload.amount = Number(payload.amount) || 0;
      payload.object_version_num = Number(payload.object_version_num) || 0;
      
      // Auto-calculate amount in OMR
      payload.receipt_line_amount = payload.receipt_line_amount || (payload.amount * payload.exchange_rate);

      // Format dates
      if (payload.payment_received_date) payload.payment_received_date = this._formatDate(payload.payment_received_date);
      if (payload.exchange_rate_date) payload.exchange_rate_date = this._formatDate(payload.exchange_rate_date);

      // Audit fields
      if (isUpdate) {
        if (payload.created_date) payload.created_date = this._formatDate(payload.created_date);
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

      // Remove read-only fields
      ['claim_number', 'supplier_name', 'supplier_number', 'header_status_name', 'request_date', 'petty_cash_type']
        .forEach(field => delete payload[field]);

      return payload;
    }

    /**
     * Validate payload
     */
    _validate(payload) {
      const errors = [];

      // Required fields
      if (!payload.claim_header_id) errors.push('Claim Header ID');
      if (!payload.mode_of_payment?.trim()) errors.push('Mode of Payment');
      if (!payload.payment_received_date) errors.push('Payment Received Date');
      if (!payload.currency) errors.push('Currency');
      if (!payload.amount || payload.amount <= 0) errors.push('Amount (must be > 0)');
      if (!payload.brief_narration?.trim()) errors.push('Brief Narration');

      // Payment date validation (cannot be future)
      // if (payload.payment_received_date) {
      //   const paymentDate = new Date(payload.payment_received_date);
      //   const today = new Date();
      //   today.setHours(0, 0, 0, 0);
        
      //   if (paymentDate > today) {
      //     errors.push('Payment date cannot be in future');
      //   }
      // }

      // if (errors.length > 0) {
      //   throw new Error(`Invalid fields:\n• ${errors.join('\n• ')}`);
      // }
    }

    /**
     * Reset form for new entry
     */
    async _resetFormForNewEntry(context) {
      const { $variables, $page } = context;
      
      // Reset the form variable but keep header-related info
      const headerInfo = {
        claim_header_id: $variables.receiptLineForm.claim_header_id,
        claim_number: $variables.receiptLineForm.claim_number,
        supplier_name: $variables.receiptLineForm.supplier_name,
        supplier_number: $variables.receiptLineForm.supplier_number,
        header_status_name: $variables.receiptLineForm.header_status_name,
        petty_cash_type: $variables.receiptLineForm.petty_cash_type
      };

      // Reset to default structure
      await Actions.resetVariables(context, {
        variables: ['$variables.receiptLineForm']
      });

      // Restore header info and defaults
      $variables.receiptLineForm = {
        ...headerInfo,
        claim_receipt_id: 0,
        currency: 'OMR',
        exchange_rate: 1,
        exchange_rate_type: 'Corporate',
        exchange_rate_date: new Date().toISOString().split('T')[0],
        amount: 0,
        object_version_num: 0,
        payment_received_date: new Date().toISOString().split('T')[0]
      };

      // Reset validation
      const vg = document.getElementById("receipt-validation");
      if (vg && vg.reset) {
        vg.reset();
      }

      console.log('✅ Receipt form reset for new entry');
    }

    /**
     * Main save action
     * @param {boolean} closeAfterSave - If true, closes dialog; if false, resets form for new entry
     */
    async run(context, { closeAfterSave = true }) {
      const { $page, $application, $variables, $constants } = context;

      if (this._isSaving) return;
      this._isSaving = true;

      try {
        // Validate UI
        if ($variables.receiptFormValid !== 'valid') {
          const vg = document.getElementById("receipt-validation");
          if (vg) {
            if (vg.valid === "invalidHidden") vg.showMessages();
            if (vg.valid !== "valid") vg.focusOn("@firstInvalidShown");
          }
          await Actions.fireNotificationEvent(context, {
            summary: "Please fix errors before saving",
            type: "warning",
            displayMode: "transient"
          });
          return;
        }

        // Build payload
        const payload = this._buildPayload(
          $variables.receiptLineForm,
          $application.user.username,
          $page.variables.payload
        );

        // Validate
        this._validate(payload);

        // Determine method
        const receiptId = payload.claim_receipt_id || 0;
        const method = receiptId > 0 ? 'PUT' : 'POST';
        const isUpdate = method === 'PUT';

        console.log(`📋 ${method} Receipt (${closeAfterSave ? 'Close' : 'Add Another'}):`, {
          id: receiptId,
          header_id: payload.claim_header_id,
          amount: payload.amount,
          payment_date: payload.payment_received_date
        });

        // Encrypt
        const [enc_key, enc_method, enc_payload] = await Promise.all([
          Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: { plainText: String(receiptId) }
          }),
          Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: { plainText: method }
          }),
          Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: { plainText: JSON.stringify(payload) }
          })
        ]);

        // Call API
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postPettycashReceiptProcess',
          headers: {
            'x-session-id': enc_key,
            'x-session-code': enc_method
          },
          body: { payload: enc_payload }
        });

        // Handle response
        if (response.body.P_ERR_CODE === 'S') {
          // Set transaction ID to header ID
          $variables.attachmentObj.P_TRANSACTION_ID = payload.claim_header_id;

          // ✅ FOR PUT: Use existing receipt ID (no decryption needed)
          if (isUpdate) {
            console.log('✅ UPDATE: Using existing receipt ID:', receiptId);
            $variables.attachmentObj.P_REFERENCE_ID = receiptId;
            
            // Upload attachments directly
            await Actions.callChain(context, {
              chain: 'save_Attachment_AC',
              params: {
                'input_hdr_param': payload.claim_header_id,
                'input_reference_id': receiptId,
                'attach_Type': $constants.receiptAttachCode,
              },
            });
            
          } else {
            // ✅ FOR POST: Decrypt the returned receipt ID
            console.log('🆕 POST: Decrypting new receipt ID');
            
            let encryptedReceiptId = null;
            if (response.headers && typeof response.headers.get === 'function') {
              encryptedReceiptId = response.headers.get('X-Session-Id') || 
                                   response.headers.get('x-session-id') ||
                                   response.headers.get('X-session-id');
            } else if (response.headers) {
              encryptedReceiptId = response.headers['X-Session-Id'] || 
                                   response.headers['x-session-id'] ||
                                   response.headers['X-session-id'];
            }
            
            if (!encryptedReceiptId) {
              console.error('❌ Response headers:', response.headers);
              throw new Error('Backend did not return encrypted receipt ID in X-Session-Id header');
            }
            
            console.log('🔑 Got encrypted receipt ID:', encryptedReceiptId);
            
            // Decrypt it
            let decrypted_receipt_id = await $application.functions.decryptJs_Normal(
              $application.constants.secretKey, 
              encryptedReceiptId
            );

            console.log('🔓 Decrypted receipt ID:', decrypted_receipt_id);

            // Create search object
            $variables.SearchObj_ReceiptLine.p_claim_header_id = payload.claim_header_id;
            $variables.SearchObj_ReceiptLine.p_claim_receipt_id = decrypted_receipt_id;

            // Encrypt search payload
            let retrieve_reference = await Actions.callChain(context, {
              chain: 'application:encLargePayloadWithTime',
              params: {
                plainText: JSON.stringify($variables.SearchObj_ReceiptLine),
              },
            });

            const temp_Payload = {
              payload: retrieve_reference
            };

            // Search for the receipt
            const response2 = await Actions.callRest(context, {
              endpoint: 'ORDS/postPettycashReceiptSearch',
              body: temp_Payload,
            });

            // If found, upload attachment
            if (response2.body.OUT_COUNT === 1) {
              $variables.attachmentObj.P_REFERENCE_ID = response2.body.P_OUTPUT[0].claim_receipt_id;

              await Actions.callChain(context, {
                chain: 'save_Attachment_AC',
                params: {
                  'input_hdr_param': payload.claim_header_id,
                  'input_reference_id': response2.body.P_OUTPUT[0].claim_receipt_id,
                  'attach_Type': $constants.receiptAttachCode,
                },
              });
            }
          }

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || `Receipt ${isUpdate ? 'updated' : 'created'} successfully`,
            type: 'confirmation',
            displayMode: 'transient'
          });

          // Refresh line tables
          await Actions.callChain(context, {
            chain: 'loadLineTablesAC',
            params: {
              'key_param': payload.claim_header_id,
            },
          });

          // ✅ Conditional behavior based on button clicked
          if (closeAfterSave) {
            // Save & Close: Close the dialog
            await Actions.callComponentMethod(context, { 
              selector: '#receiptCreateDialog', 
              method: 'close' 
            });
          } else {
            // Save & Add Another: Reset form for new entry
            await this._resetFormForNewEntry(context);
            
            // Show additional feedback
            // await Actions.fireNotificationEvent(context, {
            //   summary: "Ready to add another receipt",
            //   type: 'info',
            //   displayMode: 'transient'
            // });
          }

        } else {
          throw new Error(response.body.P_ERR_MSG || 'Save failed');
        }

      } catch (error) {
        console.error('❌ Save error:', error.message);
        await Actions.fireNotificationEvent(context, {
          summary: error.message || 'Save failed. Please try again.',
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