// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (
//   ActionChain,
//   Actions,
//   ActionUtils
// ) => {
//   'use strict';

//   class save_ClaimLine_AC extends ActionChain {

//     constructor() {
//       super();
//       this._isSaving = false;
//     }

//     /**
//      * Format date to YYYY-MM-DD
//      */
//     _formatDate(dateInput) {
//       if (!dateInput) return null;
//       const date = dateInput instanceof Date ? dateInput : new Date(dateInput.split('T')[0]);
//       return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
//     }

//     /**
//      * Generate 8-segment charge account
//      */
//     _generateChargeAccount(data, businessUnit) {
//       const isWasteWater = businessUnit?.toLowerCase().includes('waste water');
//       const isWater = businessUnit?.toLowerCase().includes('water') && !isWasteWater;

//       const segments = [
//         data.governorate_segment || '',                    // 1: Governorate (11/31)
//         data.geography_segment || (isWasteWater ? '0000' : ''),  // 2: Geography
//         data.business_activities_segment || '0000',        // 3: Business Activities
//         data.cost_center_segment || '',                    // 4: Cost Center (MANDATORY)
//         data.accounts_segment || '',                       // 5: Accounts (MANDATORY)
//         data.assets_segment || '000000',                   // 6: Assets
//         data.inter_company_segment || data.governorate_segment || '', // 7: Inter Company
//         data.future1_segment || '0000'                     // 8: Future1
//       ];

//       // Validate mandatory segments
//       const mandatory = [0, 3, 4]; // Governorate, Cost Center, Accounts
//       if (isWater) mandatory.push(1); // Geography mandatory for Water

//       const missing = mandatory.filter(i => !String(segments[i]).trim());
//       if (missing.length > 0) {
//         console.warn('⚠️ Missing mandatory segments:', missing.map(i => i + 1));
//         return null;
//       }

//       const chargeAccount = segments.join('-');
//       console.log('🔧 Charge Account:', chargeAccount);
//       return chargeAccount;
//     }

//     /**
//      * Auto-fill defaults and build complete payload
//      */
//     _buildPayload(formData, currentUser, header) {
//       const payload = { ...formData };
//       const isUpdate = payload.claim_line_id > 0;

//       // Verify header ID
//       if (!header?.claim_header_id) {
//         throw new Error('Header data not loaded. Please refresh and try again.');
//       }

//       // Business unit detection
//       const businessUnit = header.governorate || '';
//       const isWasteWater = businessUnit.toLowerCase().includes('waste water');
//       const isWater = businessUnit.toLowerCase().includes('water') && !isWasteWater;

//       // Auto-fill required fields
//       payload.claim_header_id = Number(header.claim_header_id);
      
//       // Line number (auto-increment)
//       if (!payload.line_number || payload.line_number === 0) {
//         payload.line_number = (header.line_count || 0) + 1;
//       }

//       // Segment defaults
//       if (!payload.governorate_segment) {
//         payload.governorate_segment = isWasteWater ? '11' : (isWater ? '31' : '');
//       }
//       if (!payload.geography_segment && isWasteWater) {
//         payload.geography_segment = '0000';
//       }
//       payload.business_activities_segment = payload.business_activities_segment || '0000';
//       payload.assets_segment = payload.assets_segment || '000000';
//       payload.inter_company_segment = payload.inter_company_segment || payload.governorate_segment;
//       payload.future1_segment = payload.future1_segment || '0000';

//       // Map LOV codes to segments
//       if (!payload.cost_center_segment && payload.department_code) {
//         payload.cost_center_segment = payload.department_code;
//       }
//       if (!payload.accounts_segment && payload.expense_account) {
//         payload.accounts_segment = payload.expense_account;
//       }

//       // Generate charge account if missing
//       if (!payload.charge_account?.trim()) {
//         payload.charge_account = this._generateChargeAccount(payload, businessUnit);
//       }

//       // Currency defaults
//       payload.currency = payload.currency || 'OMR';
//       payload.exchange_rate = Number(payload.exchange_rate) || 1;
//       payload.exchange_rate_type = payload.exchange_rate_type || 'Corporate';
//       payload.exchange_rate_date = payload.exchange_rate_date || new Date().toISOString();

//       // Numeric conversions
//       payload.amount = Number(payload.amount) || 0;
//       payload.object_version_num = Number(payload.object_version_num) || 0;
//       payload.amount_in_omr = payload.amount * payload.exchange_rate;
//       payload.line_amount = payload.line_amount || payload.amount_in_omr;

//       // Format dates
//       if (payload.exchange_rate_date) payload.exchange_rate_date = this._formatDate(payload.exchange_rate_date);
//       if (payload.request_date) payload.request_date = this._formatDate(payload.request_date);

//       // Audit fields
//       if (isUpdate) {
//         if (payload.created_date) payload.created_date = this._formatDate(payload.created_date);
//         payload.last_updated_by = currentUser;
//         payload.last_updated_login = currentUser;
//         delete payload.last_updated_date;
//       } else {
//         payload.created_by = currentUser;
//         payload.last_updated_by = currentUser;
//         payload.last_updated_login = currentUser;
//         delete payload.created_date;
//         delete payload.last_updated_date;
//       }

//       // Remove read-only fields
//       ['claim_number', 'supplier_name', 'supplier_number', 'header_status_name', 'petty_cash_type']
//         .forEach(field => delete payload[field]);

//       return payload;
//     }

//     /**
//      * Validate payload
//      */
//     _validate(payload) {
//       const errors = [];

//       // Required fields
//       if (!payload.claim_header_id) errors.push('Claim Header ID');
//       if (!payload.line_number) errors.push('Line Number');
//       if (!payload.charge_account?.trim()) errors.push('Charge Account');
//       if (!payload.currency) errors.push('Currency');
//       if (!payload.amount || payload.amount <= 0) errors.push('Amount (must be > 0)');
//       if (!payload.brief_narration?.trim()) errors.push('Brief Narration');

//       // Charge account format
//       if (payload.charge_account && payload.charge_account.split('-').length !== 8) {
//         errors.push('Charge Account (must have 8 segments)');
//       }

//       if (errors.length > 0) {
//         throw new Error(`Invalid fields:\n• ${errors.join('\n• ')}`);
//       }
//     }

//     /**
//      * Main save action
//      */
//     async run(context, { event, originalEvent }) {
//       const { $page, $application, $variables } = context;

//       if (this._isSaving) return;
//       this._isSaving = true;

//       try {
//         // Validate UI
//         if ($variables.isFormValid !== 'valid') {
//           const vg = document.getElementById("claim_line_formValid");
//           if (vg) {
//             if (vg.valid === "invalidHidden") vg.showMessages();
//             if (vg.valid !== "valid") vg.focusOn("@firstInvalidShown");
//           }
//           await Actions.fireNotificationEvent(context, {
//             summary: "Please fix errors before saving",
//             type: "warning",
//             displayMode: "transient"
//           });
//           return;
//         }

//         // Build payload
//         const payload = this._buildPayload(
//           $variables.claimLineForm,
//           $application.user.username,
//           $page.variables.payload
//         );

//         // Validate
//         this._validate(payload);

//         // Determine method
//         const claimLineId = payload.claim_line_id || 0;
//         const method = claimLineId > 0 ? 'PUT' : 'POST';
//         const isUpdate = method === 'PUT';

//         console.log(`📋 ${method} Line:`, {
//           id: claimLineId,
//           header_id: payload.claim_header_id,
//           line_number: payload.line_number,
//           amount: payload.amount
//         });

//         // Encrypt
//         const [enc_key, enc_method, enc_payload] = await Promise.all([
//           Actions.callChain(context, {
//             chain: 'application:encLargePayloadWithTime',
//             params: { plainText: String(claimLineId) }
//           }),
//           Actions.callChain(context, {
//             chain: 'application:encLargePayloadWithTime',
//             params: { plainText: method }
//           }),
//           Actions.callChain(context, {
//             chain: 'application:encLargePayloadWithTime',
//             params: { plainText: JSON.stringify(payload) }
//           })
//         ]);

//         // Call API
//         const response = await Actions.callRest(context, {
//           endpoint: 'ORDS/postPettycashLineProcess',
//           headers: {
//             'x-session-id': enc_key,
//             'x-session-code': enc_method
//           },
//           body: { payload: enc_payload }
//         });

//         // Handle response
//         if (response.body.P_ERR_CODE === 'S') {
//           // Set transaction ID to header ID
//           $variables.attachmentObj.P_TRANSACTION_ID = payload.claim_header_id;

//           // ✅ FOR PUT: Use existing line ID (no decryption needed)
//           if (isUpdate) {
//             console.log('✅ UPDATE: Using existing line ID:', claimLineId);
//             $variables.attachmentObj.P_REFERENCE_ID = claimLineId;
            
//             // Upload attachments directly
//             await Actions.callChain(context, {
//               chain: 'save_Attachment_AC',
//               params: {
//                 'input_hdr_param': payload.claim_header_id,
//                 'input_reference_id': claimLineId
//               },
//             });
            
//           } else {
//             // ✅ FOR POST: Decrypt the returned line ID
//             console.log('🆕 POST: Decrypting new line ID');
            
//             let encryptedLineId = null;
//             if (response.headers && typeof response.headers.get === 'function') {
//               encryptedLineId = response.headers.get('X-Session-Id') || 
//                                 response.headers.get('x-session-id') ||
//                                 response.headers.get('X-session-id');
//             } else if (response.headers) {
//               encryptedLineId = response.headers['X-Session-Id'] || 
//                                 response.headers['x-session-id'] ||
//                                 response.headers['X-session-id'];
//             }
            
//             if (!encryptedLineId) {
//               console.error('❌ Response headers:', response.headers);
//               throw new Error('Backend did not return encrypted line ID in X-Session-Id header');
//             }
            
//             console.log('🔑 Got encrypted line ID:', encryptedLineId);
            
//             // Decrypt it
//             let decrypted_key = await $application.functions.decryptJs_Normal(
//               $application.constants.secretKey, 
//               encryptedLineId
//             );

//             console.log('🔓 Decrypted line ID:', decrypted_key);

//             // Create search object
//             $variables.SearchObj_ClaimLine.p_claim_header_id = payload.claim_header_id;
//             $variables.SearchObj_ClaimLine.p_claim_line_id = decrypted_key;

//             // Encrypt search payload
//             let retrieve_reference = await Actions.callChain(context, {
//               chain: 'application:encLargePayloadWithTime',
//               params: {
//                 plainText: JSON.stringify($variables.SearchObj_ClaimLine),
//               },
//             });

//             const temp_Payload = {
//               payload: retrieve_reference
//             };

//             // Search for the line
//             const response2 = await Actions.callRest(context, {
//               endpoint: 'ORDS/postPettycashLineSearch',
//               body: temp_Payload,
//             });

//             // If found, upload attachment
//             if (response2.body.OUT_COUNT === 1) {
//               $variables.attachmentObj.P_REFERENCE_ID = response2.body.P_OUTPUT[0].claim_line_id;
              
//               await Actions.callChain(context, {
//                 chain: 'save_Attachment_AC',
//                 params: {
//                   'input_hdr_param': payload.claim_header_id,
//                   'input_reference_id': response2.body.P_OUTPUT[0].claim_line_id,
//                 },
//               });
//             }
//           }

//           await Actions.fireNotificationEvent(context, {
//             summary: response.body.P_ERR_MSG || `Line ${isUpdate ? 'updated' : 'created'} successfully`,
//             type: 'confirmation',
//             displayMode: 'transient'
//           });

//           // Refresh and close
//           await Actions.callChain(context, {
//             chain: 'loadLineTablesAC',
//             params: {
//               'key_param': payload.claim_header_id,
//             },
//           });
//           await Actions.callComponentMethod(context, { selector: '#claimCreateDialog', method: 'close' });

//         } else {
//           throw new Error(response.body.P_ERR_MSG || 'Save failed');
//         }

//       } catch (error) {
//         console.error('❌ Save error:', error.message);
//         await Actions.fireNotificationEvent(context, {
//           summary: error.message || 'Save failed. Please try again.',
//           type: 'error',
//           displayMode: 'transient'
//         });
//       } finally {
//         this._isSaving = false;
//       }
//     }

//   }

//   return save_ClaimLine_AC;
// });

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

  class save_ClaimLine_AC extends ActionChain {

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
     * Generate 8-segment charge account
     */
    _generateChargeAccount(data, businessUnit) {
      const isWasteWater = businessUnit?.toLowerCase().includes('waste water');
      const isWater = businessUnit?.toLowerCase().includes('water') && !isWasteWater;

      const segments = [
        data.governorate_segment || '',                    // 1: Governorate (11/31)
        data.geography_segment || (isWasteWater ? '0000' : ''),  // 2: Geography
        data.business_activities_segment || '0000',        // 3: Business Activities
        data.cost_center_segment || '',                    // 4: Cost Center (MANDATORY)
        data.accounts_segment || '',                       // 5: Accounts (MANDATORY)
        data.assets_segment || '000000',                   // 6: Assets
        data.inter_company_segment || data.governorate_segment || '', // 7: Inter Company
        data.future1_segment || '0000'                     // 8: Future1
      ];

      // Validate mandatory segments
      const mandatory = [0, 3, 4]; // Governorate, Cost Center, Accounts
      if (isWater) mandatory.push(1); // Geography mandatory for Water

      const missing = mandatory.filter(i => !String(segments[i]).trim());
      if (missing.length > 0) {
        console.warn('⚠️ Missing mandatory segments:', missing.map(i => i + 1));
        return null;
      }

      const chargeAccount = segments.join('.');
      console.log('🔧 Charge Account:', chargeAccount);
      return chargeAccount;
    }

    /**
     * Auto-fill defaults and build complete payload
     */
    _buildPayload(formData, currentUser, header) {
      const payload = { ...formData };
      const isUpdate = payload.claim_line_id > 0;

      // Verify header ID
      if (!header?.claim_header_id) {
        throw new Error('Header data not loaded. Please refresh and try again.');
      }

      // Business unit detection
      const businessUnit = header.governorate || '';
      const isWasteWater = businessUnit.toLowerCase().includes('waste water');
      const isWater = businessUnit.toLowerCase().includes('water') && !isWasteWater;

      // Auto-fill required fields
      payload.claim_header_id = Number(header.claim_header_id);
      
      // Line number (auto-increment)
      if (!payload.line_number || payload.line_number === 0) {
        payload.line_number = (header.line_count || 0) + 1;
      }

      // Segment defaults
      if (!payload.governorate_segment) {
        payload.governorate_segment = isWasteWater ? '11' : (isWater ? '31' : '');
      }
      if (!payload.geography_segment && isWasteWater) {
        payload.geography_segment = '0000';
      }
      payload.business_activities_segment = payload.business_activities_segment || '0000';
      payload.assets_segment = payload.assets_segment || '000000';
      payload.inter_company_segment = payload.inter_company_segment || payload.governorate_segment;
      payload.future1_segment = payload.future1_segment || '0000';

      // Map LOV codes to segments
      if (!payload.cost_center_segment && payload.department_code) {
        payload.cost_center_segment = payload.department_code;
      }
      if (!payload.accounts_segment && payload.expense_account) {
        payload.accounts_segment = payload.expense_account;
      }

      // Generate charge account if missing
      if (!payload.charge_account?.trim()) {
        payload.charge_account = this._generateChargeAccount(payload, businessUnit);
      }

      // Currency defaults
      payload.currency = payload.currency || 'OMR';
      payload.exchange_rate = Number(payload.exchange_rate) || 1;
      payload.exchange_rate_type = payload.exchange_rate_type || 'Corporate';
      payload.exchange_rate_date = payload.exchange_rate_date || new Date().toISOString();

      // Numeric conversions
      payload.amount = Number(payload.amount) || 0;
      payload.object_version_num = Number(payload.object_version_num) || 0;
      payload.amount_in_omr = payload.amount * payload.exchange_rate;
      payload.line_amount = payload.line_amount || payload.amount_in_omr;

      // ✅ ADD THIS: Budget Status default
      // Common values: 'OPEN', 'DRAFT', 'PENDING', 'NEW', 'APPROVED'
      // Please verify the correct default value for your system
      payload.budget_status = payload.budget_status || 'Valid'; // Valid, Budget Not Valid


      // Format dates
      if (payload.exchange_rate_date) payload.exchange_rate_date = this._formatDate(payload.exchange_rate_date);
      if (payload.request_date) payload.request_date = this._formatDate(payload.request_date);

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
      ['claim_number', 'supplier_name', 'supplier_number', 'header_status_name', 'petty_cash_type']
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
      if (!payload.line_number) errors.push('Line Number');
      if (!payload.charge_account?.trim()) errors.push('Charge Account');
      if (!payload.currency) errors.push('Currency');
      if (!payload.amount || payload.amount <= 0) errors.push('Amount (must be > 0)');
      if (!payload.brief_narration?.trim()) errors.push('Brief Narration');

      // Charge account format
      if (payload.charge_account && payload.charge_account.split('.').length !== 8) {
        errors.push('Charge Account (must have 8 segments)');
      }

      if (errors.length > 0) {
        throw new Error(`Invalid fields:\n• ${errors.join('\n• ')}`);
      }
    }

    /**
     * Reset form for new entry
     */
    async _resetFormForNewEntry(context) {
      const { $variables, $page } = context;
      
      // Reset the form variable but keep header-related info
      const headerInfo = {
        claim_header_id: $variables.claimLineForm.claim_header_id,
        claim_number: $variables.claimLineForm.claim_number,
        supplier_name: $variables.claimLineForm.supplier_name,
        supplier_number: $variables.claimLineForm.supplier_number,
        header_status_name: $variables.claimLineForm.header_status_name,
        petty_cash_type: $variables.claimLineForm.petty_cash_type,
        governorate_segment: $variables.claimLineForm.governorate_segment,
        // geography_segment: $variables.claimLineForm.geography_segment,
        business_activities_segment: $variables.claimLineForm.business_activities_segment,
        inter_company_segment: $variables.claimLineForm.inter_company_segment,
        future1_segment: $variables.claimLineForm.future1_segment
      };

      // Reset to default structure
      await Actions.resetVariables(context, {
        variables: [
    '$variables.claimLineForm',
    '$variables.dependent_values',
  ],
      });

      // Restore header info and defaults
      $variables.claimLineForm = {
        ...headerInfo,
        claim_line_id: 0,
        line_number: 0,
        currency: 'OMR',
        exchange_rate: 1,
        exchange_rate_type: 'Corporate',
        exchange_rate_date: new Date().toISOString().split('T')[0],
        amount: 0,
        object_version_num: 0
      };

      // Reset validation
      const vg = document.getElementById("claim_line_formValid");
      if (vg && vg.reset) {
        vg.reset();
      }

      console.log('✅ Form reset for new entry');
    }

    /**
     * Main save action
     * @param {boolean} closeAfterSave - If true, closes dialog; if false, resets form for new entry
     */
    async run(context, { event, originalEvent, closeAfterSave = true }) {
      const { $page, $application, $variables, $constants } = context;

      if (this._isSaving) return;
      this._isSaving = true;

      try {
        // Validate UI
        if ($variables.isFormValid !== 'valid') {
          const vg = document.getElementById("claim_line_formValid");
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
          $variables.claimLineForm,
          $application.user.username,
          $page.variables.payload
        );

        // Validate
        this._validate(payload);

        // Determine method
        const claimLineId = payload.claim_line_id || 0;
        const method = claimLineId > 0 ? 'PUT' : 'POST';
        const isUpdate = method === 'PUT';

        console.log(`📋 ${method} Line (${closeAfterSave ? 'Close' : 'Add Another'}):`, {
          id: claimLineId,
          header_id: payload.claim_header_id,
          line_number: payload.line_number,
          amount: payload.amount
        });

        // Encrypt
        const [enc_key, enc_method, enc_payload] = await Promise.all([
          Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: { plainText: String(claimLineId) }
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
          endpoint: 'ORDS/postPettycashLineProcess',
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

          // ✅ FOR PUT: Use existing line ID (no decryption needed)
          if (isUpdate) {
            console.log('✅ UPDATE: Using existing line ID:', claimLineId);
            $variables.attachmentObj.P_REFERENCE_ID = claimLineId;
            
            // Upload attachments directly
            await Actions.callChain(context, {
              chain: 'save_Attachment_AC',
              params: {
                'input_hdr_param': payload.claim_header_id,
                'input_reference_id': claimLineId,
                'attach_Type': $constants.lineAttachCode,
              },
            });
            
          } else {
            // ✅ FOR POST: Decrypt the returned line ID
            console.log('🆕 POST: Decrypting new line ID');
            
            let encryptedLineId = null;
            if (response.headers && typeof response.headers.get === 'function') {
              encryptedLineId = response.headers.get('X-Session-Id') || 
                                response.headers.get('x-session-id') ||
                                response.headers.get('X-session-id');
            } else if (response.headers) {
              encryptedLineId = response.headers['X-Session-Id'] || 
                                response.headers['x-session-id'] ||
                                response.headers['X-session-id'];
            }
            
            if (!encryptedLineId) {
              console.error('❌ Response headers:', response.headers);
              throw new Error('Backend did not return encrypted line ID in X-Session-Id header');
            }
            
            console.log('🔑 Got encrypted line ID:', encryptedLineId);
            
            // Decrypt it
            let decrypted_key = await $application.functions.decryptJs_Normal(
              $application.constants.secretKey, 
              encryptedLineId
            );

            console.log('🔓 Decrypted line ID:', decrypted_key);

            // Create search object
            $variables.SearchObj_ClaimLine.p_claim_header_id = payload.claim_header_id;
            $variables.SearchObj_ClaimLine.p_claim_line_id = decrypted_key;

            // Encrypt search payload
            let retrieve_reference = await Actions.callChain(context, {
              chain: 'application:encLargePayloadWithTime',
              params: {
                plainText: JSON.stringify($variables.SearchObj_ClaimLine),
              },
            });

            const temp_Payload = {
              payload: retrieve_reference
            };

            // Search for the line
            const response2 = await Actions.callRest(context, {
              endpoint: 'ORDS/postPettycashLineSearch',
              body: temp_Payload,
            });

            // If found, upload attachment
            if (response2.body.OUT_COUNT === 1) {
              $variables.attachmentObj.P_REFERENCE_ID = response2.body.P_OUTPUT[0].claim_line_id;
              
              await Actions.callChain(context, {
                chain: 'save_Attachment_AC',
                params: {
                  'input_hdr_param': payload.claim_header_id,
                  'input_reference_id': response2.body.P_OUTPUT[0].claim_line_id,
                  'attach_Type': $constants.lineAttachCode,
                },
              });
            }
          }

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || `Line ${isUpdate ? 'updated' : 'created'} successfully`,
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
              selector: '#claimCreateDialog', 
              method: 'close' 
            });
          } else {
            // Save & Add Another: Reset form for new entry
            await this._resetFormForNewEntry(context);
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

  return save_ClaimLine_AC;
});