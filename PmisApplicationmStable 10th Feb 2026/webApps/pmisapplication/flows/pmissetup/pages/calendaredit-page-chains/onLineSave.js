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

  class onLineSave extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.isSaveAndClose - 'Y' for Save & Close, 'N' for Save & Add Another
     */
    async run(context, { isSaveAndClose }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Set header ID for the line
        $variables.calendarLineVar.cal_hdr_id = $variables.calendarHeaderVar.cal_hdr_id;

        // Determine mode and prepare encrypted data
        const isEditMode = $variables.isLineMethod === 'EDIT';
        const httpMethod = isEditMode ? 'PUT' : 'POST';
        const sessionId = isEditMode ? $variables.lineKey : '0';

        // ✅ Auto-assign line number for POST (CREATE) operations
        if (!isEditMode) {
          $variables.calendarLineVar.line_num = ($variables.totalRecords || 0) + 1;
          console.log("📝 Auto-assigned line number:", $variables.calendarLineVar.line_num);
        }

        // Encrypt all required data
        const [enc_method, enc_session_id, enc_payload] = await Promise.all([
          Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: { input: httpMethod },
          }),
          isEditMode
            ? Promise.resolve($variables.lineKey)
            : Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: sessionId },
            }),
          Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: { input: $variables.calendarLineVar },
          }),
        ]);

        // Make REST API call
        const response = await Actions.callRest(context, {
          endpoint: 'PmisSetup/postCalendarLineProcess',
          headers: {
            'x-session-id': enc_session_id,
            'x-session-code': enc_method,
          },
          body: { payload: enc_payload },
        });

        // Handle response
        const isSuccess = response.body.P_ERR_CODE === 'S';

        // Process based on success and mode
        if (isSuccess) {
          if (!isEditMode) {
            // CREATE mode - handle new record
            await this.handleCreateSuccess(context, response, isSaveAndClose);
          } else {
            // ✅ FIXED: Pass isSaveAndClose to handleEditSuccess
            // EDIT mode - handle update
            await this.handleEditSuccess(context, response, isSaveAndClose);
          }
        } else {
          // Only fire error notification if operation failed
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Operation failed',
            displayMode: 'transient',
            type: 'error',
          });
        }

      } catch (error) {
        console.error('onLineSave error:', error);
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
        // Switch to EDIT mode
        $variables.lineKey = encryptedId;
        $variables.isLineMethod = 'EDIT';

        // Attempt to reload the newly created line
        const reloadSuccess = await this.reloadLineData(context, encryptedId);

        if (!reloadSuccess) {
          console.warn('Failed to reload newly created record');
        }
      } else {
        console.warn('No encrypted ID returned in response headers');
        await Actions.fireNotificationEvent(context, {
          summary: 'Record saved but unable to reload. Please refresh the page.',
          displayMode: 'transient',
          type: 'warning',
        });
      }

      // Reload table and handle dialog - THIS WILL FIRE THE NOTIFICATION
      await this.reloadTableAndHandleDialog(context, response, isSaveAndClose, 'created');
    }

    /**
     * ✅ FIXED: Handle successful EDIT operation with isSaveAndClose parameter
     */
    async handleEditSuccess(context, response, isSaveAndClose) {
      const { $variables } = context;
      
      // Reload table
      await Actions.callChain(context, {
        chain: 'vbAfterNavigateListener',
      });

      if (isSaveAndClose === 'Y') {
        // Save & Close - Close dialog
        await Actions.callComponentMethod(context, {
          selector: '#lineDialog',
          method: 'close',
        });

        // Fire notification with server message
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || 'Calendar line updated successfully',
          displayMode: 'transient',
          type: 'confirmation',
        });

      } else if (isSaveAndClose === 'N') {
        // Save & Add Another - Reset form to CREATE mode and keep dialog open
        await this.resetFormForNewEntry(context);

        // Fire notification with server message
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || 'Calendar line updated successfully',
          displayMode: 'transient',
          type: 'confirmation',
        });
      }
    }

    /**
     * Reload specific line data
     * @returns {boolean} Success status
     */
    async reloadLineData(context, encryptedId) {
      const { $variables } = context;

      try {
        const reloadResponse = await Actions.callRest(context, {
          endpoint: 'PmisSetup/getPmisCalendarLineGetbyid',
          headers: {
            'x-session-id': encryptedId,
          },
        });

        if (reloadResponse.body.count === 1) {
          $variables.calendarLineVar = reloadResponse.body.items[0];
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error reloading line data:', error);
        return false;
      }
    }

    async reloadTableAndHandleDialog(context, response, isSaveAndClose, operation) {
      const { $variables } = context;

      // Reload calendar lines table
      await Actions.callChain(context, {
        chain: 'vbAfterNavigateListener',
      });

      if (isSaveAndClose === 'Y') {
        // Save & Close - Close dialog
        await Actions.callComponentMethod(context, {
          selector: '#lineDialog',
          method: 'close',
        });

        // ✅ Use server message from response (includes Line ID)
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || `Calendar line ${operation} successfully`,
          displayMode: 'transient',
          type: 'confirmation',
        });

      } else if (isSaveAndClose === 'N') {
        // Save & Add Another - Reset form and keep dialog open
        await this.resetFormForNewEntry(context);

        // Fire notification after resetting form
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || `Calendar line ${operation} successfully`,
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
          '$variables.calendarLineVar',
        ],
      });

      // Reset to CREATE mode
      $variables.isLineMethod = 'CREATE';
      $variables.lineKey = null;

      // Maintain header relationship
      $variables.calendarLineVar.cal_hdr_id = $variables.calendarHeaderVar.cal_hdr_id;

      // ✅ Auto-assign next line number for "Save & Add Another"
      $variables.calendarLineVar.line_num = ($variables.totalRecords || 0) + 1;
      console.log("📝 Next line number for new entry:", $variables.calendarLineVar.line_num);
    }

    /**
     * Extract header value with fallback for different header formats
     * @returns {string|null} Header value or null if not found
     */
    extractHeaderValue(headers, headerNames) {
      if (!headers) return null;

      // Try Headers.get() method (for Headers object)
      if (typeof headers.get === 'function') {
        for (const name of headerNames) {
          const value = headers.get(name);
          if (value) return value;
        }
      }

      // Try direct property access (for plain object)
      for (const name of headerNames) {
        if (headers[name]) return headers[name];
      }

      return null;
    }
  }

  return onLineSave;
});