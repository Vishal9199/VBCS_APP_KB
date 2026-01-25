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
     * Format date to YYYY-MM-DD for Oracle
     */
    _formatDate(dateInput) {
      if (!dateInput) return null;
      
      const date = dateInput instanceof Date 
        ? dateInput 
        : new Date(dateInput.split('T')[0] + 'T00:00:00');

      if (isNaN(date.getTime())) return null;

      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    /**
     * Generate charge account from segments (8 parts)
     * Based on Business Unit: Waste Water vs Water
     */
    _generateChargeAccount(data, businessUnit) {
      // Determine if Waste Water or Water
      const isWasteWater = businessUnit?.toLowerCase().includes('waste water');
      const isWater = businessUnit?.toLowerCase().includes('water') && !isWasteWater;

      // SEGMENT 1: Governorate (11 for Waste Water, 31 for Water)
      const governorate_segment = String(data.governorate_segment || '');

      // SEGMENT 2: Geography (0000 for Waste Water, User entered for Water - MANDATORY)
      let geography_segment = String(data.geography_segment || '');
      if (!geography_segment) {
        geography_segment = isWasteWater ? '0000' : '';
      }

      // SEGMENT 3: Business Activities (Default: 0000)
      const business_activities_segment = String(data.business_activities_segment || '0000');

      // SEGMENT 4: Cost Center (User entered - MANDATORY)
      const cost_center_segment = String(data.cost_center_segment || '');

      // SEGMENT 5: Accounts (User entered - MANDATORY)
      const accounts_segment = String(data.accounts_segment || '');

      // SEGMENT 6: Assets (Default: 000000)
      const assets_segment = String(data.assets_segment || '000000');

      // SEGMENT 7: Inter Company (Same as governorate - 11 for Waste Water, 31 for Water)
      const inter_company_segment = String(data.inter_company_segment || governorate_segment);

      // SEGMENT 8: Future1 (Default: 0000)
      const future1_segment = String(data.future1_segment || '0000');

      // Build segments array
      const segments = [
        governorate_segment,
        geography_segment,
        business_activities_segment,
        cost_center_segment,
        accounts_segment,
        assets_segment,
        inter_company_segment,
        future1_segment
      ];

      // Validate mandatory segments
      const mandatorySegments = {
        1: 'Governorate Segment',
        4: 'Cost Center Segment',
        5: 'Accounts Segment'
      };

      // Geography is mandatory for Water
      if (isWater) {
        mandatorySegments[2] = 'Geography Segment (Mandatory for Water)';
      }

      const missingSegments = [];
      Object.entries(mandatorySegments).forEach(([index, name]) => {
        const segmentIndex = parseInt(index) - 1;
        const segment = segments[segmentIndex];
        // Convert to string and check if empty
        const segmentStr = segment != null ? String(segment).trim() : '';
        if (!segmentStr || segmentStr === '') {
          missingSegments.push(name);
        }
      });

      if (missingSegments.length > 0) {
        console.warn('⚠️ Missing mandatory segments:', missingSegments.join(', '));
        return null;
      }

      const chargeAccount = segments.join('-');
      console.log('🔧 Generated charge account:', {
        businessUnit: isWasteWater ? 'Waste Water' : 'Water',
        segments: {
          1: `${governorate_segment} (Governorate)`,
          2: `${geography_segment} (Geography${isWater ? ' - User Entered' : ''})`,
          3: `${business_activities_segment} (Business Activities)`,
          4: `${cost_center_segment} (Cost Center - User)`,
          5: `${accounts_segment} (Accounts - User)`,
          6: `${assets_segment} (Assets)`,
          7: `${inter_company_segment} (Inter Company)`,
          8: `${future1_segment} (Future1)`
        },
        result: chargeAccount
      });

      return chargeAccount;
    }

    /**
     * Auto-fill missing required fields
     */
    _autoFillDefaults(payload, $page, currentUser) {
      const header = $page.variables.payload;
      
      // Determine business unit
      const businessUnit = header?.governorate || '';
      const isWasteWater = businessUnit.toLowerCase().includes('waste water');
      const isWater = businessUnit.toLowerCase().includes('water') && !isWasteWater;

      console.log('🏢 Business Unit:', {
        governorate: businessUnit,
        type: isWasteWater ? 'Waste Water' : (isWater ? 'Water' : 'Unknown')
      });

      // ═══════════════════════════════════════════════════════
      // CLAIM HEADER ID
      // ═══════════════════════════════════════════════════════
      if (!payload.claim_header_id) {
        payload.claim_header_id = header?.claim_header_id || $page.variables.p_nav_id;
      }

      // ═══════════════════════════════════════════════════════
      // LINE NUMBER (auto-increment)
      // ═══════════════════════════════════════════════════════
      if (!payload.line_number || payload.line_number === 0) {
        const existingLines = $page.variables.claimLineADP?.data || [];
        const maxLine = existingLines.length > 0 
          ? Math.max(...existingLines.map(l => Number(l.line_number) || 0))
          : (header?.line_count || 0);
        payload.line_number = maxLine + 1;
      }

      // ═══════════════════════════════════════════════════════
      // SEGMENT 1: GOVERNORATE SEGMENT
      // Waste Water: 11, Water: 31
      // ═══════════════════════════════════════════════════════
      if (!payload.governorate_segment) {
        if (isWasteWater) {
          payload.governorate_segment = '11';
        } else if (isWater) {
          payload.governorate_segment = '31';
        } else if (header?.governorate) {
          payload.governorate_segment = header.governorate;
        }
        console.log('✅ Set governorate_segment:', payload.governorate_segment);
      }

      // ═══════════════════════════════════════════════════════
      // SEGMENT 2: GEOGRAPHY SEGMENT
      // Waste Water: 0000 (default), Water: User enters (MANDATORY)
      // ═══════════════════════════════════════════════════════
      if (!payload.geography_segment) {
        if (isWasteWater) {
          payload.geography_segment = '0000';
          console.log('✅ Set geography_segment (Waste Water):', payload.geography_segment);
        } else if (isWater) {
          // For Water, leave empty - user MUST enter
          payload.geography_segment = '';
          console.log('⚠️ Geography segment MUST be entered by user (Water - MANDATORY)');
        }
      }

      // ═══════════════════════════════════════════════════════
      // SEGMENT 3: BUSINESS ACTIVITIES (Default: 0000)
      // ═══════════════════════════════════════════════════════
      if (!payload.business_activities_segment) {
        payload.business_activities_segment = '0000';
      }

      // ═══════════════════════════════════════════════════════
      // SEGMENT 4: COST CENTER (From Department Code LOV - FDD Field #17)
      // User selects from SaaS GL Cost Center Codes
      // ═══════════════════════════════════════════════════════
      if (!payload.cost_center_segment && payload.department_code) {
        payload.cost_center_segment = payload.department_code;
        console.log('✅ Mapped department_code to cost_center_segment:', payload.cost_center_segment);
      }
      
      if (!payload.cost_center_segment) {
        console.warn('⚠️ Cost Center segment is mandatory (user must select Department Code from LOV)');
      }

      // ═══════════════════════════════════════════════════════
      // SEGMENT 5: ACCOUNTS (From Expense Account LOV - FDD Field #15)
      // User selects from SaaS GL Accounts (Type=Expense)
      // ═══════════════════════════════════════════════════════
      if (!payload.accounts_segment && payload.expense_account) {
        payload.accounts_segment = payload.expense_account;
        console.log('✅ Mapped expense_account to accounts_segment:', payload.accounts_segment);
      }
      
      if (!payload.accounts_segment) {
        console.warn('⚠️ Accounts segment is mandatory (user must select Expense Account from LOV)');
      }

      // ═══════════════════════════════════════════════════════
      // SEGMENT 6: ASSETS (Default: 000000)
      // ═══════════════════════════════════════════════════════
      if (!payload.assets_segment) {
        payload.assets_segment = '000000';
      }

      // ═══════════════════════════════════════════════════════
      // SEGMENT 7: INTER COMPANY (Same as governorate)
      // Waste Water: 11, Water: 31
      // ═══════════════════════════════════════════════════════
      if (!payload.inter_company_segment) {
        payload.inter_company_segment = payload.governorate_segment;
        console.log('✅ Set inter_company_segment (same as governorate):', payload.inter_company_segment);
      }

      // ═══════════════════════════════════════════════════════
      // SEGMENT 8: FUTURE1 (Default: 0000)
      // ═══════════════════════════════════════════════════════
      if (!payload.future1_segment) {
        payload.future1_segment = '0000';
      }

      // ═══════════════════════════════════════════════════════
      // CURRENCY AND EXCHANGE RATE DEFAULTS
      // ═══════════════════════════════════════════════════════
      payload.currency = payload.currency || 'OMR';
      payload.exchange_rate = Number(payload.exchange_rate) || 1;
      payload.exchange_rate_type = payload.exchange_rate_type || 'Corporate';
      payload.exchange_rate_date = payload.exchange_rate_date || new Date().toISOString();
      
      // ═══════════════════════════════════════════════════════
      // NUMERIC CONVERSIONS
      // ═══════════════════════════════════════════════════════
      payload.amount = Number(payload.amount) || 0;
      payload.line_number = Number(payload.line_number) || 1;
      payload.object_version_num = Number(payload.object_version_num) || 0;
      
      // ═══════════════════════════════════════════════════════
      // AUTO-CALCULATE AMOUNTS
      // ═══════════════════════════════════════════════════════
      payload.amount_in_omr = payload.amount_in_omr || (payload.amount * payload.exchange_rate);
      payload.line_amount = payload.line_amount || payload.amount_in_omr;

      console.log('✅ Auto-filled defaults:', {
        claim_header_id: payload.claim_header_id,
        line_number: payload.line_number,
        governorate_segment: payload.governorate_segment,
        geography_segment: payload.geography_segment,
        inter_company_segment: payload.inter_company_segment,
        currency: payload.currency,
        amount: payload.amount
      });

      return payload;
    }

    /**
     * Build complete payload for POST/PUT
     */
    _buildPayload(formData, currentUser, $page) {
      const payload = { ...formData };
      const isUpdate = payload.claim_line_id && payload.claim_line_id !== 0;
      const header = $page.variables.payload;
      const businessUnit = header?.governorate || '';

      console.log(`🔨 Building ${isUpdate ? 'UPDATE' : 'CREATE'} payload`);

      // Step 1: Auto-fill defaults
      this._autoFillDefaults(payload, $page, currentUser);

      // Step 2: Generate charge account if missing
      const chargeAccountStr = payload.charge_account ? String(payload.charge_account).trim() : '';
      if (!chargeAccountStr || chargeAccountStr === '') {
        const generated = this._generateChargeAccount(payload, businessUnit);
        if (generated) {
          payload.charge_account = generated;
          console.log('🔧 Generated charge_account:', generated);
        } else {
          console.warn('⚠️ Could not generate charge_account - check mandatory segments');
        }
      } else {
        console.log('✅ Using provided charge_account:', payload.charge_account);
      }

      // Step 3: Format dates
      if (payload.exchange_rate_date) {
        payload.exchange_rate_date = this._formatDate(payload.exchange_rate_date);
      }
      if (payload.request_date) {
        payload.request_date = this._formatDate(payload.request_date);
      }

      // Step 4: Handle audit fields
      if (isUpdate) {
        // UPDATE: Keep created_by, update last_updated_by
        if (payload.created_date) {
          payload.created_date = this._formatDate(payload.created_date);
        }
        payload.last_updated_by = currentUser;
        payload.last_updated_login = currentUser;
        delete payload.last_updated_date; // Oracle SYSDATE
      } else {
        // CREATE: Set all audit fields
        payload.created_by = currentUser;
        payload.last_updated_by = currentUser;
        payload.last_updated_login = currentUser;
        delete payload.created_date;
        delete payload.last_updated_date; // Oracle SYSDATE
      }

      // Step 5: Clean up read-only fields from search
      const readOnlyFields = [
        'claim_number',
        'supplier_name', 
        'supplier_number',
        'header_status_name',
        'petty_cash_type'
      ];
      readOnlyFields.forEach(field => delete payload[field]);

      console.log('📦 Payload ready:', {
        claim_line_id: payload.claim_line_id,
        claim_header_id: payload.claim_header_id,
        line_number: payload.line_number,
        charge_account: payload.charge_account,
        amount: payload.amount
      });

      return payload;
    }

    /**
     * Validate payload
     */
    _validate(payload) {
      const errors = [];

      // Required fields
      const required = {
        claim_header_id: 'Claim Header ID',
        line_number: 'Line Number',
        charge_account: 'Charge Account',
        currency: 'Currency',
        amount: 'Amount',
        brief_narration: 'Brief Narration'
      };

      for (const [field, label] of Object.entries(required)) {
        const value = payload[field];
        if (value == null || (typeof value === 'string' && value.trim() === '')) {
          errors.push(label);
        }
      }

      // Charge account format (8 segments)
      if (payload.charge_account) {
        const chargeAccountStr = String(payload.charge_account);
        if (chargeAccountStr.split('-').length !== 8) {
          errors.push('Charge Account (must have 8 segments)');
        }
      }

      // Amount validation
      if (payload.amount <= 0) {
        errors.push('Amount (must be greater than 0)');
      }

      // Line number validation
      if (payload.line_number <= 0) {
        errors.push('Line Number (must be greater than 0)');
      }

      if (errors.length > 0) {
        throw new Error(`Invalid fields:\n• ${errors.join('\n• ')}`);
      }

      return true;
    }

    /**
     * Main save action
     */
    async run(context, { event, originalEvent }) {
      const { $page, $application, $variables } = context;

      // Prevent double-save
      if (this._isSaving) {
        console.log('⏳ Save in progress...');
        return;
      }
      this._isSaving = true;

      const startTime = performance.now();

      try {
        // ═════════════════════════════════════════════════════
        // STEP 1: UI Validation
        // ═════════════════════════════════════════════════════
        
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

        // ═════════════════════════════════════════════════════
        // STEP 2: Build & Validate Payload
        // ═════════════════════════════════════════════════════
        
        console.log('🔨 Building payload from:', $variables.claimLineForm);
        
        const payload = this._buildPayload(
          $variables.claimLineForm,
          $application.user.username,
          $page
        );

        this._validate(payload);
        console.log('✅ Validation passed');

        // ═════════════════════════════════════════════════════
        // STEP 3: Determine Operation Type
        // ═════════════════════════════════════════════════════
        
        const claimLineId = payload.claim_line_id || 0;
        const isUpdate = claimLineId !== 0;
        const method = isUpdate ? 'PUT' : 'POST';

        console.log(`📋 ${method} operation for line_number: ${payload.line_number}`);

        // ═════════════════════════════════════════════════════
        // STEP 4: Encrypt Payload
        // ═════════════════════════════════════════════════════
        
        const payloadJson = JSON.stringify(payload);
        console.log(`📤 Payload size: ${payloadJson.length} bytes`);

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
            params: { plainText: payloadJson }
          })
        ]);

        console.log('🔐 Encryption complete');

        // ═════════════════════════════════════════════════════
        // STEP 5: API Call
        // ═════════════════════════════════════════════════════
        
        console.log('📡 Calling API...');
        
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postPettycashLineProcess',
          headers: {
            'x-session-id': enc_key,
            'x-session-code': enc_method
          },
          body: { payload: enc_payload }
        });

        console.log('📬 Response:', response.body);

        // ═════════════════════════════════════════════════════
        // STEP 6: Handle Response
        // ═════════════════════════════════════════════════════
        
        if (response.body.P_ERR_CODE === 'S') {
          // SUCCESS
          const message = response.body.P_ERR_MSG || 
            `Claim line ${isUpdate ? 'updated' : 'created'} successfully`;
          
          await Actions.fireNotificationEvent(context, {
            summary: message,
            type: 'confirmation',
            displayMode: 'transient'
          });

          // Refresh table
          await Actions.callChain(context, {
            chain: 'loadLineTablesAC'
          });

          // Close dialog
          await Actions.callComponentMethod(context, {
            selector: '#claimCreateDialog',
            method: 'close'
          });

          // Starting Re-Calculation Action Chain

          await Actions.callChain(context, {
            chain: 'reCalculate_HeaderAmounts_AC',
          });

          const totalTime = (performance.now() - startTime).toFixed(0);
          console.log(`✅ ${method} completed in ${totalTime}ms`);

        } else {
          // ERROR
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Save failed',
            type: 'error',
            displayMode: 'transient'
          });

          console.error('❌ Server error:', response.body.P_ERR_MSG);
        }

      } catch (error) {
        // ═════════════════════════════════════════════════════
        // STEP 7: Error Handling
        // ═════════════════════════════════════════════════════
        
        console.error('❌ Save failed:', error.message);
        
        await Actions.fireNotificationEvent(context, {
          summary: error.message || 'Save failed. Please try again.',
          type: 'error',
          displayMode: 'transient'
        });

      } finally {
        // ═════════════════════════════════════════════════════
        // STEP 8: Cleanup
        // ═════════════════════════════════════════════════════
        
        this._isSaving = false;
        const totalTime = (performance.now() - startTime).toFixed(0);
        console.log(`🔓 Released lock. Total: ${totalTime}ms`);
      }
    }

  }

  return save_ClaimLine_AC;
});