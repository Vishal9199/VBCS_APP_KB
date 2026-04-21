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

  class onEstimateCostLineSave extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.isSaveAndClose - 'Y' for Save & Close, 'N' for Save & Add Another
     */
    async run(context, { isSaveAndClose }) {
      const { $page, $flow, $application, $variables } = context;

      try {
        // ========== VALIDATION ==========
        if (!$variables.projectCharterVar.project_charter_id) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error: Parent record not saved',
            message: 'Please save the Project Charter header first',
            displayMode: 'transient',
            type: 'error',
          });
          return;
        }

        // Set parent ID for the line
        $variables.estimateCostVar.project_charter_id = $variables.projectCharterVar.project_charter_id;

        // ✅ USE FLAG VARIABLE TO DETERMINE MODE
        const isCreateMode = $variables.isEstCreate === 'Y';
        const httpMethod = isCreateMode ? 'POST' : 'PUT';

        console.log(`💰 ${isCreateMode ? 'CREATE' : 'UPDATE'} Estimate Cost Line`);
        console.log('💰 Mode Flag:', $variables.isEstCreate);
        console.log('💰 Cost Data:', {
          est_cost_id: $variables.estimateCostVar.est_cost_id,
          project_charter_id: $variables.estimateCostVar.project_charter_id
        });

        // ========== ENCRYPT KEY ==========
        const keyToEncrypt = isCreateMode 
          ? '0' 
          : String($variables.estimateCostVar.est_cost_id || '0');

        const enc_session_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: keyToEncrypt },
        });

        console.log(`🔐 Session ID encrypted (key: ${keyToEncrypt})`);

        // ========== ENCRYPT METHOD ==========
        const enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: httpMethod },
        });

        console.log(`🔐 Method encrypted: ${httpMethod}`);

        // ========== PREPARE PAYLOAD ==========
        const costPayload = {
          est_cost_id: isCreateMode ? 0 : $variables.estimateCostVar.est_cost_id,
          object_version_num: $variables.estimateCostVar.object_version_num || 1,
          project_charter_id: $variables.projectCharterVar.project_charter_id,
          est_capax_cost: $variables.estimateCostVar.est_capax_cost,
          capax_unit: $variables.estimateCostVar.capax_unit,
          est_opex_cost: $variables.estimateCostVar.est_opex_cost,
          opex_unit: $variables.estimateCostVar.opex_unit,
          ref_num: $variables.estimateCostVar.ref_num,
          additional_info: $variables.estimateCostVar.additional_info,
          created_by: isCreateMode 
            ? ($application.user.email || 'CURRENT_USER')
            : $variables.estimateCostVar.created_by,
          last_updated_by: $application.user.email || 'CURRENT_USER',
          last_updated_login: $application.user.email || 'CURRENT_USER',
        };

        console.log("📦 Cost Line Payload:", JSON.stringify(costPayload, null, 2));

        // ========== ENCRYPT PAYLOAD ==========
        const enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: costPayload },
        });

        console.log("🔐 Payload encrypted");

        // ========== CALL ORDS ENDPOINT ==========
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmispamProjectcharterEstcostProcess',
          headers: {
            'x-session-id': enc_session_id,
            'x-session-code': enc_method,
          },
          body: { payload: enc_payload },
        });

        console.log("📥 Cost Line Response:", response.body);

        // ========== HANDLE RESPONSE ==========
        const isSuccess = response.body.P_ERR_CODE === 'S';

        if (isSuccess) {
          if (isCreateMode) {
            // CREATE mode - handle new record
            await this.handleCreateSuccess(context, response, isSaveAndClose);
          } else {
            // EDIT mode - handle update
            await this.handleEditSuccess(context, response, isSaveAndClose);
          }
        } else {
          // Operation failed
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Operation failed',
            displayMode: 'transient',
            type: 'error',
          });
        }

      } catch (error) {
        console.error('❌ onEstimateCostLineSave error:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Error: ' + (error.message || 'An unexpected error occurred'),
          displayMode: 'transient',
          type: 'error',
        });
      }
    }

    /**
     * Handle successful CREATE operation
     */
    async handleCreateSuccess(context, response, isSaveAndClose) {
      const { $variables } = context;

      // Extract encrypted ID from response headers
      const encryptedId = this.extractHeaderValue(response.headers, ['X-Session-Id', 'x-session-id']);

      if (encryptedId) {
        console.log(`✅ New Cost ID returned: ${encryptedId}`);

        // Update the current record with new ID
        $variables.estimateCostVar.est_cost_id = encryptedId;

        // ✅ SWITCH TO EDIT MODE
        $variables.isEstCreate = 'N';

        // Attempt to reload the newly created line
        const reloadSuccess = await this.reloadLineData(context, encryptedId);

        if (!reloadSuccess) {
          console.warn('⚠️ Failed to reload newly created cost record');
        }
      } else {
        console.warn('⚠️ No encrypted ID returned in response headers');
      }

      // Reload table and handle dialog
      await this.reloadTableAndHandleDialog(context, response, isSaveAndClose, 'created');
    }

    /**
     * Handle successful EDIT operation
     */
    async handleEditSuccess(context, response, isSaveAndClose) {
      const { $variables } = context;
      
      // Update object version if returned
      if (response.body.object_version_num) {
        $variables.estimateCostVar.object_version_num = response.body.object_version_num;
      }

      // Reload table
      await Actions.callChain(context, {
        chain: 'loadEstimateCosts',
      });

      if (isSaveAndClose === 'Y') {
        // Save & Close - Close dialog
        await Actions.callComponentMethod(context, {
          selector: '#estimateCostDialog',
          method: 'close',
        });

        // Fire notification
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || 'Estimate cost updated successfully',
          displayMode: 'transient',
          type: 'confirmation',
        });

      } else if (isSaveAndClose === 'N') {
        // Save & Add Another - Reset form to CREATE mode
        await this.resetFormForNewEntry(context);

        // Fire notification
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || 'Estimate cost updated successfully',
          displayMode: 'transient',
          type: 'confirmation',
        });
      }
    }

    /**
     * Reload specific line data
     */
    async reloadLineData(context, encryptedId) {
      const { $variables } = context;

      try {
        const reloadResponse = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamProjectcharterEstcostGetbyid',
          headers: {
            'x-session-id': encryptedId,
          },
        });

        if (reloadResponse.body.count === 1) {
          $variables.estimateCostVar = reloadResponse.body.items[0];
          return true;
        }
        return false;
      } catch (error) {
        console.error('❌ Error reloading cost line data:', error);
        return false;
      }
    }

    /**
     * Reload table and handle dialog
     */
    async reloadTableAndHandleDialog(context, response, isSaveAndClose, operation) {
      const { $variables } = context;

      // Reload estimate costs table
      await Actions.callChain(context, {
        chain: 'loadEstimateCosts',
      });

      if (isSaveAndClose === 'Y') {
        // Save & Close - Close dialog
        await Actions.callComponentMethod(context, {
          selector: '#estimateCostDialog',
          method: 'close',
        });

        // Fire notification
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || `Estimate cost ${operation} successfully`,
          displayMode: 'transient',
          type: 'confirmation',
        });

      } else if (isSaveAndClose === 'N') {
        // Save & Add Another - Reset form and keep dialog open
        await this.resetFormForNewEntry(context);

        // Fire notification
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || `Estimate cost ${operation} successfully`,
          displayMode: 'transient',
          type: 'confirmation',
        });
      }
    }

    /**
     * Reset form for new entry (Save & Add Another)
     */
    async resetFormForNewEntry(context) {
      const { $variables } = context;

      // Reset line variable
      await Actions.resetVariables(context, {
        variables: [
          '$variables.estimateCostVar',
        ],
      });

      // ✅ RESET TO CREATE MODE
      $variables.isEstCreate = 'Y';

      // Maintain parent relationship
      $variables.estimateCostVar.project_charter_id = $variables.projectCharterVar.project_charter_id;

      console.log("✅ Form reset for new estimate cost entry");
    }

    /**
     * Extract header value with fallback
     */
    extractHeaderValue(headers, headerNames) {
      if (!headers) return null;

      // Try Headers.get() method
      if (typeof headers.get === 'function') {
        for (const name of headerNames) {
          const value = headers.get(name);
          if (value) return value;
        }
      }

      // Try direct property access
      for (const name of headerNames) {
        if (headers[name]) return headers[name];
      }

      return null;
    }
  }

  return onEstimateCostLineSave;
});