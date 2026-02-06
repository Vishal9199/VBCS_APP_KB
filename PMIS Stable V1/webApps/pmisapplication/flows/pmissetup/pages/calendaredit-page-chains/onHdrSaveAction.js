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
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Determine HTTP method and session ID based on mode
        const isEditMode = $variables.pNavCode === 'EDIT';
        const httpMethod = isEditMode ? 'PUT' : 'POST';
        const sessionId = isEditMode ? $variables.pNavId : '0'; // '0' for new records

        // Encrypt HTTP method
        const enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: httpMethod,
          },
        });

        // Encrypt session ID (only for CREATE mode)
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
            input: $variables.calendarHeaderVar,
          },
        });

        // Make REST API call
        const response = await Actions.callRest(context, {
          endpoint: 'PmisSetup/postPmisCalendarProcess',
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
        
        // Fire notification
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || (isSuccess ? 'Operation completed successfully' : 'Operation failed'),
          displayMode: 'transient',
          type: isSuccess ? 'confirmation' : 'error',
        });

        // If CREATE was successful, switch to EDIT mode and reload data
        if (!isEditMode && isSuccess) {
          // Extract encrypted ID from response headers
          const encryptedId = this.extractHeaderValue(response.headers, ['X-Session-Id', 'x-session-id']);
          
          if (encryptedId) {
            $variables.pNavId = encryptedId;
            $variables.pNavCode = 'EDIT';

            // Reload the newly created header data
            const reloadResponse = await Actions.callRest(context, {
              endpoint: 'PmisSetup/getPmisCalendarDtl',
              headers: {
                'x-session-id': $variables.pNavId,
              },
            });

            if (reloadResponse.body.count === 1) {
              $variables.calendarHeaderVar = reloadResponse.body.items[0];
              
              // await Actions.fireNotificationEvent(context, {
              //   summary: 'Record saved successfully. Now in edit mode.',
              //   displayMode: 'transient',
              //   type: 'info',
              // });
            } else {
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
        }

      } catch (error) {
        console.error('onHdrSaveAction error:', error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error: ' + (error.message || 'An unexpected error occurred'),
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