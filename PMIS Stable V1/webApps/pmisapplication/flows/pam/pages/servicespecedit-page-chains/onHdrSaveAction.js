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

  class onHdrSaveAction extends ActionChain {

    /**
     * @param {Object} context
     * @returns {Object} - { status: 'S' | 'E', message: string, isVersionConflict: boolean }
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ❌ Validation failed
      if($variables.formValidation !== "valid") {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please fix the required fields.',
          displayMode: 'transient',
          type: 'warning',
        });

        return {
          status: 'E',
          message: 'Validation failed - required fields missing',
          isVersionConflict: false
        };
      }

      try {
        // Determine HTTP method and session ID based on mode
        const isEditMode = $variables.pNavCode === 'EDIT';
        const httpMethod = isEditMode ? 'PUT' : 'POST';
        const sessionId = isEditMode ? $variables.pNavId : '0';

        // ✅ CRITICAL: Validate version number for PUT operations
        if (isEditMode) {
          if ($variables.serviceSpecVar.object_version_num === undefined || 
              $variables.serviceSpecVar.object_version_num === null) {
            await Actions.fireNotificationEvent(context, {
              summary: 'Error: Version number missing. Please refresh the page.',
              displayMode: 'transient',
              type: 'error',
            });
            
            return {
              status: 'E',
              message: 'Version number missing',
              isVersionConflict: false
            };
          }
          
          console.log('📝 Sending PUT with version:', $variables.serviceSpecVar.object_version_num);
        }

        // Encrypt HTTP method
        const enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: httpMethod,
          },
        });

        // Encrypt session ID
        let enc_session_id = isEditMode ? $variables.pNavId : await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: sessionId,
          },
        });

        // Encrypt payload
        const enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.serviceSpecVar,
          },
        });

        console.log('🔐 Sending', httpMethod, 'request to backend');

        // Make REST API call
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmispamServicespecProcess',
          headers: {
            'x-session-id': enc_session_id,
            'x-session-code': enc_method,
          },
          body: {
            payload: enc_payload,
          },
        });

        // Handle response
        const isSuccess = response.body.P_ERR_CODE === 'S';
        const errorMsg = response.body.P_ERR_MSG || '';

        console.log('📥 Backend response:', isSuccess ? 'SUCCESS' : 'ERROR');
        console.log('📄 Message:', errorMsg);

        // ✅ CRITICAL: Special handling for version conflicts
        const isVersionConflict = errorMsg.includes('modified by another user') || 
                                 errorMsg.includes('Expected version') ||
                                 errorMsg.includes('Sent version');

        if (isVersionConflict) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Record Updated by Another User',
            message: 'This record was modified by another user. Your changes cannot be saved. The page will refresh with the latest data.',
            displayMode: 'persist',
            type: 'warning',
          });
          
          console.warn('⚠️ Version conflict detected - reloading data');
          
          // Force reload to get latest version
          if (isEditMode) {
            await this.reloadHeaderData(context);
          }
          
          return {
            status: 'E',
            message: errorMsg,
            isVersionConflict: true
          };
        }

        // Fire standard notification
        await Actions.fireNotificationEvent(context, {
          summary: errorMsg || (isSuccess ? 'Operation completed successfully' : 'Operation failed'),
          displayMode: 'transient',
          type: isSuccess ? 'confirmation' : 'error',
        });

        // ❌ Backend returned error
        if (!isSuccess) {
          return {
            status: 'E',
            message: errorMsg,
            isVersionConflict: false
          };
        }

        // ✅ CRITICAL: Reload data after BOTH POST and PUT
        if (!isEditMode) {
          // ===== CREATE MODE: Switch to EDIT and reload with new ID =====
          const encryptedId = this.extractHeaderValue(response.headers, ['X-Session-Id', 'x-session-id', 'P-PRIMARYKEY']);
          
          if (encryptedId) {
            console.log('✅ CREATE successful - switching to EDIT mode');
            
            $variables.pNavId = encryptedId;
            $variables.pNavCode = 'EDIT';
            
            // Reload the newly created record
            await this.reloadHeaderData(context);
            
            console.log('🔄 Reloaded with new version:', $variables.serviceSpecVar.object_version_num);
          } else {
            console.warn('⚠️ No encrypted ID returned in response headers');
            
            await Actions.fireNotificationEvent(context, {
              summary: 'Record saved but unable to reload. Please refresh the page.',
              displayMode: 'transient',
              type: 'warning',
            });
            
            return {
              status: 'E',
              message: 'Record saved but unable to reload',
              isVersionConflict: false
            };
          }
        } else {
          // ===== UPDATE MODE: Reload to get incremented version number =====
          console.log('✅ UPDATE successful - reloading to get new version number');
          
          const oldVersion = $variables.serviceSpecVar.object_version_num;
          await this.reloadHeaderData(context);
          const newVersion = $variables.serviceSpecVar.object_version_num;
          
          console.log('🔄 Version updated:', oldVersion, '→', newVersion);
        }

        // ✅ SUCCESS - Return 'S'
        return {
          status: 'S',
          message: errorMsg || 'Operation completed successfully',
          isVersionConflict: false
        };

      } catch (error) {
        console.error('❌ onHdrSaveAction error:', error);
        console.error('❌ Error stack:', error.stack);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error: ' + (error.message || 'An unexpected error occurred'),
          displayMode: 'transient',
          type: 'error',
        });
        
        // ❌ EXCEPTION - Return 'E'
        return {
          status: 'E',
          message: error.message || 'An unexpected error occurred',
          isVersionConflict: false
        };
      }
    }

    /**
     * ✅ Reload header data (for both CREATE and UPDATE)
     */
    async reloadHeaderData(context) {
      const { $variables } = context;

      try {
        console.log('🔄 Reloading service specification data...');

        const reloadResponse = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamServicespecGetbyid',
          headers: {
            'x-session-id': $variables.pNavId,
          },
        });

        if (reloadResponse.body.count === 1) {
          $variables.serviceSpecVar = reloadResponse.body.items[0];
          
          console.log('✅ Data reloaded successfully');
          console.log('📊 Current version:', $variables.serviceSpecVar.object_version_num);
        } else {
          console.warn('⚠️ Failed to reload - unexpected response count:', reloadResponse.body.count);
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Warning: Unable to refresh data. Please reload the page.',
            displayMode: 'transient',
            type: 'warning',
          });
        }
      } catch (error) {
        console.error('❌ Error reloading header data:', error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error: Unable to refresh data',
          displayMode: 'transient',
          type: 'error',
        });
      }
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

  return onHdrSaveAction;
});