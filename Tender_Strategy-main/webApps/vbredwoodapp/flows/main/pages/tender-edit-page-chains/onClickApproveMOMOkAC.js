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

  class onClickApproveMOMOkAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      // ✅ Check if Reject form is valid
      if ($flow.variables.actionValidation.isApproveMOMFormValid === "valid") {
        try {
          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'open',
          });

          await Actions.callChain(context, {
            chain: 'saveDocumentsAC',
          });

          // Encrypt and save normal fields
          const normalResult = await this.saveNormalFields(context);

          if (!normalResult.success) {
            throw new Error('Normal fields save failed: ' + normalResult.message);
          }

          console.log("✅ Normal fields saved successfully");

          // ⭐ FETCH LATEST VERSION after normal fields save
          await this.fetchLatestVersion(context);

          //notification pending

          if ($variables.postPayloadTypeVar.mom_notify === 'Y') {

            let sessionId = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: $variables.postPayloadTypeVar.strategy_hdr_id,
              },
            });

            let processType = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: 'TENDERSTRATEGY',
              },
            });

            const mailResponse = await Actions.callRest(context, {
              endpoint: 'ORDS/postCommonMomMail',
              headers: {
                'x-process-type': processType,
                'x-session-id': sessionId,
              },
            });
            
          } 


          await Actions.callChain(context, {
            chain: 'onClickApproveOk',
          });


          const approveMOMFormDialogClose = await Actions.callComponentMethod(context, {
            selector: '#ApproveMOMFormDialog',
            method: 'close',
          });


        } finally {
        }

      } else {

        await $functions.handleValidationError($flow.variables.actionValidation.approveMOMFormValidation);

      }
    }

    /**
    * ⭐ NEW: Fetch latest object version number from backend
    */
    async fetchLatestVersion(context) {
      const { $variables } = context;

      try {
        console.log("📡 Fetching latest version number...");

        // Encrypt the strategy_hdr_id for the GET request
        const encryptedKey = $variables.pNavId; // Already encrypted

        // Call GET endpoint to fetch latest record
        const getResponse = await Actions.callRest(context, {
          endpoint: 'ORDS/getTenderStrategyDtl2', // Replace with your actual GET endpoint
          headers: {
            'X-session-id': encryptedKey,
          },
        });

        if (getResponse.body && getResponse.body.object_version_num !== undefined) {
          const latestVersion = getResponse.body.object_version_num;
          $variables.postPayloadTypeVar.object_version_num = latestVersion;
          console.log(`✅ Version updated from backend: ${latestVersion}`);
        } else {
          console.warn("⚠️ Could not fetch version, using local increment");
          $variables.postPayloadTypeVar.object_version_num += 1;
        }

      } catch (error) {
        console.error("❌ Error fetching version:", error);
        // Fallback: increment locally
        $variables.postPayloadTypeVar.object_version_num += 1;
        console.log("⚠️ Using local increment as fallback");
      }
    }

    /**
     * Save normal (non-CLOB) fields
     */
    async saveNormalFields(context) {
      const { $variables } = context;

      try {

        $variables.postTenderVar_Normal = $variables.postPayloadTypeVar;
        const payload = JSON.stringify($variables.postTenderVar_Normal);

        const encryptedPayload = await Actions.callChain(context, {
          chain: 'application:encryptLargePayloadWithTime',
          params: { plainText: payload },
        });

        const encryptedMethod = await Actions.callChain(context, {
          chain: 'application:encryptLargePayloadWithTime',
          params: { plainText: 'PUT' },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postTenderStrategyProcess2',
          body: { payload: encryptedPayload },
          headers: {
            'X-session-id': $variables.pNavId,
            'X-session-code': encryptedMethod,
          },
        });

        return {
          success: response.body.P_ERR_CODE === 'S',
          message: response.body.P_ERR_MSG,
        };

      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  }

  return onClickApproveMOMOkAC;
});
