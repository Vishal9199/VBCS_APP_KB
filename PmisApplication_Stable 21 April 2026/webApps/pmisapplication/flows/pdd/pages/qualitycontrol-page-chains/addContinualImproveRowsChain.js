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

  class addContinualImproveRowsChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        document.getElementById('progressDialog').open();

        // const CryptoJS = window.CryptoJS;
        // const encryptionKey = 'your-encryption-key';

        // const encryptedTenderId = CryptoJS.AES.encrypt($application.variables.pTenderId, encryptionKey).toString();
        // const encryptedPeriod = CryptoJS.AES.encrypt($application.variables.pPeriod, encryptionKey).toString();
        // const encryptedUserName = CryptoJS.AES.encrypt($application.user, encryptionKey).toString();
        // const encryptedType = CryptoJS.AES.encrypt('CONTINUAL_IMPROVE', encryptionKey).toString();

        //  let encryptedTenderId = await Actions.callChain(context, {
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
            input: 'CONTINUAL_IMPROVE',
          },
        });

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

        if (addResponse.body && addResponse.body.P_ERR_CODE === 'S') {
          const dataResponse = await Actions.callRest(context, {
            endpoint: 'PDD/getPmispddQualitycontrolCommonGetbyid',
            headers: {
              // tender_id: encryptedTenderId,
              'p-tender-id': $application.variables.pTenderId,
              'p-period': encryptedPeriod,
              'p-type': encryptedType
            }
          });

          await Actions.fireDataProviderEvent(context, {
            target: $variables.continualImproveADP,
            refresh: null
          });

          console.log("+++++++++++++123: ", JSON.stringify($variables.continualImproveADP.data));
          console.log("+++++++++++++1234: ", JSON.stringify(dataResponse.body.OUTPUT));
          $variables.continualImproveADP.data = dataResponse.body.OUTPUT || [];

          await Actions.fireNotificationEvent(context, {
            summary: 'Continual Improvement rows added successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });

        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'Failed to add Continual Improvement rows',
            displayMode: 'transient',
          });
        }
      } catch (error) {
        console.error('Error adding Continual Improvement rows:', error);
        await Actions.fireNotificationEvent(context, {
            summary: 'Failed to add rows',
            displayMode: 'transient',
          });
      } finally {
        document.getElementById('progressDialog').close();
      }
    }
  }

  return addContinualImproveRowsChain;
});