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

  class save_SiteLine_Batch_AC extends ActionChain {

    constructor() {
      super();
      this._isSaving = false;
    }

    /**
     * ✅ Format date to YYYY-MM-DD (ISO format for Oracle)
     */
    _formatDateForOracle(dateValue) {
      if (!dateValue) return null;

      try {
        let date;
        
        // Handle different input types
        if (dateValue instanceof Date) {
          date = dateValue;
        } else if (typeof dateValue === 'string') {
          // Try parsing ISO string
          date = new Date(dateValue);
        } else {
          return null;
        }

        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', dateValue);
          return null;
        }

        // ✅ Format to YYYY-MM-DD (ISO format that Oracle accepts)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error('Date formatting error:', error, 'for value:', dateValue);
        return null;
      }
    }

    /**
     * Prepare payload with date formatting
     */
    _preparePayload(rowData, claimHeaderId) {
      const payload = { ...rowData };
      payload.claim_header_id = claimHeaderId;

      // Format all date fields to ISO format
      const dateFields = [
        'exchange_rate_date',
        'request_date',
        'created_date',
        'last_updated_date'
      ];

      dateFields.forEach(field => {
        if (payload[field]) {
          const formattedDate = this._formatDateForOracle(payload[field]);
          console.log(`📅 ${field}: ${payload[field]} → ${formattedDate}`);
          payload[field] = formattedDate;
        }
      });

      return payload;
    }

    /**
     * Basic validation - just check required fields exist
     */
    _validate(payload, rowIndex) {
      const errors = [];

      if (!payload.claim_header_id) errors.push('Claim Header ID');
      if (!payload.charge_account?.trim()) errors.push('Charge Account');
      if (!payload.amount || payload.amount <= 0) errors.push('Amount');

      if (errors.length > 0) {
        throw new Error(`Row ${rowIndex + 1} - Missing: ${errors.join(', ')}`);
      }
    }

    /**
     * Save a single row - POST only
     */
    async _saveSingleRow(context, rowData, rowIndex, claimHeaderId) {
      try {
        // ✅ Prepare payload with proper date formatting
        const payload = this._preparePayload(rowData, claimHeaderId);
        
        // Basic validation only
        this._validate(payload, rowIndex);

        // Always POST (creating new lines from site references)
        const method = 'POST';
        const referenceId = payload.reference_claim_line_id || 0;

        console.log(`📋 POST Row ${rowIndex + 1}:`, {
          reference_id: referenceId,
          header_id: payload.claim_header_id,
          charge_account: payload.charge_account,
          amount: payload.amount,
          exchange_rate_date: payload.exchange_rate_date,
          request_date: payload.request_date
        });

        // Encrypt - use reference_claim_line_id as key
        const [enc_key, enc_method, enc_payload] = await Promise.all([
          Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: { plainText: String(referenceId) }
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

        if (response.body.P_ERR_CODE === 'S') {
          return {
            success: true,
            rowIndex: rowIndex,
            message: response.body.P_ERR_MSG || `Row ${rowIndex + 1} saved`,
            referenceId: referenceId
          };
        } else {
          throw new Error(response.body.P_ERR_MSG || 'Save failed');
        }

      } catch (error) {
        console.error(`❌ Row ${rowIndex + 1} error:`, error.message);
        return {
          success: false,
          rowIndex: rowIndex,
          message: error.message,
          error: error
        };
      }
    }

    /**
     * Main batch save action
     */
    async run(context) {
      const { $page, $variables } = context;

      if (this._isSaving) {
        await Actions.fireNotificationEvent(context, {
          summary: "Save in progress, please wait...",
          type: "warning",
          displayMode: "transient"
        });
        return;
      }

      this._isSaving = true;

      try {
  // ✅ Get claim_header_id early
  const claimHeaderId = $variables.payload.claim_header_id;
  
  if (!claimHeaderId) {
    throw new Error('Claim Header ID not found. Please refresh and try again.');
  }

  // ✅ Get table element
  const tableElement = document.querySelector('#addSiteLine oj-table');
        
        if (!tableElement) {
          throw new Error('Table not found in dialog');
        }

        console.log('🔍 Table element found:', tableElement);

        // ✅ Get selected rows - KeySet object
        const selectedRowsKeySet = tableElement.selected?.row;
        
        console.log('🔍 Selected KeySet object:', selectedRowsKeySet);
        console.log('🔍 Selected KeySet.keys:', selectedRowsKeySet?.keys);

        // Check if we have selections
        if (!selectedRowsKeySet || !selectedRowsKeySet.keys || selectedRowsKeySet.keys.size === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: "Please select at least one row to save",
            type: "warning",
            displayMode: "transient"
          });
          return;
        }

        // ✅ Extract keys from KeySet properly
        let selectedKeys = [];
        
        // Method 1: Try accessing keys property directly
        if (selectedRowsKeySet.keys && selectedRowsKeySet.keys instanceof Set) {
          selectedKeys = Array.from(selectedRowsKeySet.keys);
          console.log('🔍 Extracted keys from KeySet.keys (Set):', selectedKeys);
        }
        // Method 2: Try values() method
        else if (selectedRowsKeySet.values && typeof selectedRowsKeySet.values === 'function') {
          selectedKeys = Array.from(selectedRowsKeySet.values());
          console.log('🔍 Extracted keys from KeySet.values():', selectedKeys);
        }
        // Method 3: Try iterating the KeySet itself
        else if (selectedRowsKeySet[Symbol.iterator]) {
          selectedKeys = Array.from(selectedRowsKeySet);
          console.log('🔍 Extracted keys from KeySet iterator:', selectedKeys);
        }

        console.log('🔍 Final selected keys:', selectedKeys);
        console.log('🔍 Selected count:', selectedKeys.length);

        if (selectedKeys.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: "Could not retrieve selection. Please try selecting rows again.",
            type: "warning",
            displayMode: "transient"
          });
          return;
        }

        const selectedCount = selectedKeys.length;
        console.log(`📋 Processing ${selectedCount} selected rows`);

        // Show processing notification
        // await Actions.fireNotificationEvent(context, {
        //   summary: `Processing ${selectedCount} row(s)...`,
        //   type: "info",
        //   displayMode: "transient"
        // });

        // ✅ Get data directly from ADP
        const allData = $variables.siteLineADP.data || [];
        
        console.log('🔍 Total data in ADP:', allData.length);
        console.log('🔍 Sample row:', allData[0]);

        // ✅ Filter selected rows using reference_claim_line_id as key
        const selectedRowsData = allData.filter(row => 
          selectedKeys.includes(row.reference_claim_line_id)
        );

        console.log('🔍 Matched rows:', selectedRowsData.length);
        console.log('🔍 Matched data:', selectedRowsData);

        // Validate we have data
        if (selectedRowsData.length === 0) {
          throw new Error('Could not retrieve selected row data. Key mismatch or data not loaded properly.');
        }

        // Process all selected rows
        const results = [];
        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < selectedRowsData.length; i++) {
          const result = await this._saveSingleRow(
            context,
            selectedRowsData[i],
            i,
            claimHeaderId
          );
          
          results.push(result);
          
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
          }
        }

        console.log('📊 Results:', { successCount, failureCount });

        // Show summary notification
        if (failureCount === 0) {
          // All succeeded
          await Actions.fireNotificationEvent(context, {
            summary: `Successfully saved ${successCount} row(s)`,
            type: 'confirmation',
            displayMode: 'transient',
          });

          // Get header ID from first row
          // const headerId = selectedRowsData[0]?.claim_header_id;
          // const headerId = $variables.payload.claim_header_id;
          
          // if (headerId) {
            // Refresh line tables
            await Actions.callChain(context, {
              chain: 'loadLineTablesAC',
              params: {
                'key_param': claimHeaderId,
              },
            });
          // }

          // Close dialog
          await Actions.callComponentMethod(context, { 
            selector: '#addSiteLine', 
            method: 'close' 
          });

        } else if (successCount === 0) {
          // All failed
          const errorMessages = results
            .filter(r => !r.success)
            .map(r => `Row ${r.rowIndex + 1}: ${r.message}`)
            .join('\n');
          
          await Actions.fireNotificationEvent(context, {
            summary: `Failed to save ${failureCount} row(s)`,
            message: errorMessages,
            type: 'error',
            displayMode: 'persist',
          });

        } else {
          // Mixed results
          const errorMessages = results
            .filter(r => !r.success)
            .map(r => `Row ${r.rowIndex + 1}: ${r.message}`)
            .join('\n');
          
          await Actions.fireNotificationEvent(context, {
            summary: `Saved ${successCount} row(s), ${failureCount} failed`,
            message: errorMessages,
            type: 'warning',
            displayMode: 'persist',
          });

          // Refresh even with partial success
          // const headerId = selectedRowsData[0]?.claim_header_id;
          // const headerId = $variables.payload.claim_header_id;
          // if (headerId) {
            await Actions.callChain(context, {
              chain: 'loadLineTablesAC',
              params: {
                'key_param': claimHeaderId,
              },
            });
          // }
        }

      } catch (error) {
        console.error('❌ Batch save error:', error);
        console.error('❌ Error stack:', error.stack);
        
        await Actions.fireNotificationEvent(context, {
          summary: error.message || 'Batch save failed. Please try again.',
          message: 'Check console for details',
          type: 'error',
          displayMode: 'transient'
        });
      } finally {
        this._isSaving = false;
      }
    }

  }

  return save_SiteLine_Batch_AC;
});