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

  class onMajorRiskLineSave extends ActionChain {

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
        $variables.majorRiskVar.project_charter_id = $variables.projectCharterVar.project_charter_id;

        // ✅ USE FLAG VARIABLE TO DETERMINE MODE
        const isCreateMode = $variables.isRiskCreate === 'Y';
        const httpMethod = isCreateMode ? 'POST' : 'PUT';

        console.log(`⚠️ ${isCreateMode ? 'CREATE' : 'UPDATE'} Major Risk Line`);
        console.log('⚠️ Mode Flag:', $variables.isRiskCreate);
        console.log('⚠️ Risk Data:', {
          major_risk_id: $variables.majorRiskVar.major_risk_id,
          project_charter_id: $variables.majorRiskVar.project_charter_id
        });

        // ========== ENCRYPT KEY ==========
        const keyToEncrypt = isCreateMode 
          ? '0' 
          : String($variables.majorRiskVar.major_risk_id || '0');

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
        const riskPayload = {
          major_risk_id: isCreateMode ? 0 : $variables.majorRiskVar.major_risk_id,
          object_version_num: $variables.majorRiskVar.object_version_num || 1,
          project_charter_id: $variables.projectCharterVar.project_charter_id,
          major_risk_title: $variables.majorRiskVar.major_risk_title,
          description: $variables.majorRiskVar.description,
          impact: $variables.majorRiskVar.impact,
          mitigation: $variables.majorRiskVar.mitigation,
          ref_num: $variables.majorRiskVar.ref_num,
          additional_info: $variables.majorRiskVar.additional_info,
          created_by: isCreateMode 
            ? ($application.user.email || 'CURRENT_USER')
            : $variables.majorRiskVar.created_by,
          last_updated_by: $application.user.email || 'CURRENT_USER',
          last_updated_login: $application.user.email || 'CURRENT_USER',
        };

        console.log("📦 Risk Line Payload:", JSON.stringify(riskPayload, null, 2));

        // ========== ENCRYPT PAYLOAD ==========
        const enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: riskPayload },
        });

        console.log("🔐 Payload encrypted");

        // ========== CALL ORDS ENDPOINT ==========
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmispamProjectcharterRiskProcess',
          headers: {
            'x-session-id': enc_session_id,
            'x-session-code': enc_method,
          },
          body: { payload: enc_payload },
        });

        console.log("📥 Risk Line Response:", response.body);

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
        console.error('❌ onMajorRiskLineSave error:', error);
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
        console.log(`✅ New Risk ID returned: ${encryptedId}`);

        // Update the current record with new ID
        $variables.majorRiskVar.major_risk_id = encryptedId;

        // ✅ SWITCH TO EDIT MODE
        $variables.isRiskCreate = 'N';

        // Attempt to reload the newly created line
        const reloadSuccess = await this.reloadLineData(context, encryptedId);

        if (!reloadSuccess) {
          console.warn('⚠️ Failed to reload newly created risk record');
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
        $variables.majorRiskVar.object_version_num = response.body.object_version_num;
      }

      // Reload table
      await Actions.callChain(context, {
        chain: 'loadMajorRisks',
      });

      if (isSaveAndClose === 'Y') {
        // Save & Close - Close dialog
        await Actions.callComponentMethod(context, {
          selector: '#majorRiskDialog',
          method: 'close',
        });

        // Fire notification
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || 'Major risk updated successfully',
          displayMode: 'transient',
          type: 'confirmation',
        });

      } else if (isSaveAndClose === 'N') {
        // Save & Add Another - Reset form to CREATE mode
        await this.resetFormForNewEntry(context);

        // Fire notification
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || 'Major risk updated successfully',
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
          endpoint: 'PAM/getPmispamProjectcharterRiskGetbyid',
          headers: {
            'x-session-id': encryptedId,
          },
        });

        if (reloadResponse.body.count === 1) {
          $variables.majorRiskVar = reloadResponse.body.items[0];
          return true;
        }
        return false;
      } catch (error) {
        console.error('❌ Error reloading risk line data:', error);
        return false;
      }
    }

    /**
     * Reload table and handle dialog
     */
    async reloadTableAndHandleDialog(context, response, isSaveAndClose, operation) {
      const { $variables } = context;

      // Reload major risks table
      await Actions.callChain(context, {
        chain: 'loadMajorRisks',
      });

      if (isSaveAndClose === 'Y') {
        // Save & Close - Close dialog
        await Actions.callComponentMethod(context, {
          selector: '#majorRiskDialog',
          method: 'close',
        });

        // Fire notification
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || `Major risk ${operation} successfully`,
          displayMode: 'transient',
          type: 'confirmation',
        });

      } else if (isSaveAndClose === 'N') {
        // Save & Add Another - Reset form and keep dialog open
        await this.resetFormForNewEntry(context);

        // Fire notification
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || `Major risk ${operation} successfully`,
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
          '$variables.majorRiskVar',
        ],
      });

      // ✅ RESET TO CREATE MODE
      $variables.isRiskCreate = 'Y';

      // Maintain parent relationship
      $variables.majorRiskVar.project_charter_id = $variables.projectCharterVar.project_charter_id;

      console.log("✅ Form reset for new major risk entry");
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

  return onMajorRiskLineSave;
});