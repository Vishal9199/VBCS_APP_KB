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

  class addQualityAssuranceRowsChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Show progress dialog
        document.getElementById('progressDialog').open();

        // Encrypt parameters using CryptoJS
        // const CryptoJS = window.CryptoJS;
        // const encryptionKey = 'your-encryption-key'; // Replace with actual key

        // const encryptedTenderId = CryptoJS.AES.encrypt($application.variables.pTenderId, encryptionKey).toString();
        // const encryptedPeriod = CryptoJS.AES.encrypt($application.variables.pPeriod, encryptionKey).toString();
        // const encryptedUserName = CryptoJS.AES.encrypt($application.user, encryptionKey).toString();
        // const encryptedType = CryptoJS.AES.encrypt('QUALITY_ASSURANCE', encryptionKey).toString();

        // let encryptedTenderId = await Actions.callChain(context, {
        //   chain: 'application:encryptAC',
        //   params: {
        //     input: $application.variables.pTenderId,
        //   },
        // });
        let encryptedPeriod = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $application.variables.pPeriod,
          },
        });
        let encryptedUserName = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $application.user.email,
          },
        });
        let encryptedType = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: 'QUALITY_ASSURANCE',
          },
        });

        

        // Call REST endpoint to add rows
        const addResponse = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddQualitycontrolPostProcess',
          headers: {
            // 'x-tender-id': encryptedTenderId,
            'x-tender-id': $application.variables.pTenderId,
            'x-period': encryptedPeriod,
            'x-user-name': encryptedUserName,
            'x-type': encryptedType
          }
        });

        // Check response
        if (addResponse.body && addResponse.body.P_ERR_CODE === 'S') {
          // Reload data
          const dataResponse = await Actions.callRest(context, {
            endpoint: 'PDD/getPmispddQualitycontrolCommonGetbyid',
            headers: {
              // tender_id: encryptedTenderId,
              'p-tender-id': $application.variables.pTenderId,
              'p-period': encryptedPeriod,
              'p-type': encryptedType
            }
          });

          // Refresh ArrayDataProvider
          await Actions.fireDataProviderEvent(context, {
            target: $variables.qualityAssuranceADP,
            refresh: null
          });
          // Update data variable
          console.log("+++++++++++++123: ", JSON.stringify($variables.qualityAssuranceADP.data));
          console.log("+++++++++++++1234: ", JSON.stringify(dataResponse.body.OUTPUT));
          $variables.qualityAssuranceADP.data = dataResponse.body.OUTPUT || [];


          // Show success message
          await Actions.fireNotificationEvent(context, {
            summary: 'Quality Assurance rows added successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });

        } else {
          // Show error message
          await Actions.fireNotificationEvent(context, {
            summary: addResponse.body.P_ERR_MSG || 'Failed to add rows',
            displayMode: 'transient',
            type: 'confirmation',
          });
        }
      } catch (error) {
        console.error('Error adding Quality Assurance rows:', error);
          await Actions.fireNotificationEvent(context, {
            summary: 'Failed to add Quality Assurance rows',
            displayMode: 'transient',
            type: 'confirmation',
          });

      } finally {
        // Hide progress dialog
        document.getElementById('progressDialog').close();
      }
    }
  }

  return addQualityAssuranceRowsChain;
});