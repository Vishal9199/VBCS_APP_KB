define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
  'resources/js/approvalProcess',
], (
  ActionChain,
  Actions,
  ActionUtils,
  ApprovalProcess
) => {
  'use strict';

  class onClickRpaOkBtn_ACBtn_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      // ✅ Check if RPA form is valid
      console.log("RPA OK Action Started");
      console.log("isRpaFormValid: ", 'A ' + $flow.variables.actionValidation.isRpaFormValid + ' B');
      
      if ($flow.variables.actionValidation.isRpaFormValid === "valid") {
        try {
          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'open',
          });

          // ============================================
          // STEP 1: Package Update (RPA_DIRECT)
          // ============================================
          console.log('Step 1: Updating action with RPA_DIRECT...');
          
          // --- Prepare RPA update payload ---
          $flow.variables.updateActionObj.p_action_code = 'RPA';
          $flow.variables.updateActionObj.p_comments = $flow.variables.responseComments || '-';
          $flow.variables.updateActionObj.p_to_person_id = String($flow.variables.updateActionObj.p_to_person_id);
          $flow.variables.updateActionObj.p_more_info_type = "RPA_DIRECT";

          console.log('RPA Update Payload:', {
            p_action_code: $flow.variables.updateActionObj.p_action_code,
            p_to_person_id: $flow.variables.updateActionObj.p_to_person_id,
            p_more_info_type: $flow.variables.updateActionObj.p_more_info_type,
            p_trx_id: $flow.variables.updateActionObj.p_trx_id,
            p_action_id: $flow.variables.updateActionObj.p_action_id
          });

          let enc_payload = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $flow.variables.updateActionObj,
            },
          });

          // --- Package Update REST call ---
          const updateResponse = await Actions.callRest(context, {
            endpoint: 'ORDS/postApprovalProcessSecUpdate',
            body: {"payload": enc_payload},
          });

          if (updateResponse?.body?.P_ERROR_CODE !== "S") {
            throw new Error(updateResponse?.body?.P_ERROR_MSG || 'RPA action update failed');
          }

          console.log('✅ Package Update Response:', updateResponse.body);

          // ============================================
          // STEP 2: Terminate Current Approval Process
          // ============================================
          console.log('Step 2: Terminating current approval process...');
          
          // ✅ Validate instance number
          if (!$flow.variables.updateActionObj.p_instance_number) {
            throw new Error('Process instance number is missing. Please refresh and try again.');
          }

          const instanceNumber = String($flow.variables.updateActionObj.p_instance_number);
          
          if (!instanceNumber || instanceNumber === 'undefined' || instanceNumber === 'null') {
            throw new Error('Invalid process instance number: ' + instanceNumber);
          }

          const terminateBody = {
            action: 'TERMINATE',
            instanceActionProps: {
              reason: $flow.variables.responseComments || 'Terminated for RPA_DIRECT resubmission',
            },
          };

          console.log('Terminate Request:', {
            instanceNumber: instanceNumber,
            body: terminateBody
          });

          // --- Terminate REST call ---
          const terminateResponse = await Actions.callRest(context, {
            endpoint: 'ProcessApi/postProcessApiV1InstancesP_instance_id',
            uriParams: {
              'p_instance_id': instanceNumber,
            },
            body: terminateBody,
          });

          if (!terminateResponse?.ok) {
            throw new Error('Process termination failed: ' + (terminateResponse?.body?.detail || 'Unknown error'));
          }

          console.log('✅ Terminate Response:', terminateResponse.body);

          // ============================================
          // STEP 3: Validation ORDS to Get Process Code
          // ============================================
          console.log('Step 3: Getting approval process code via validation...');

          // --- Encrypt app code header ---
          const appCode = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: { input: $constants.apprProcess },
          });

          // --- Common validation to get process code ---
          const validationResponse = await Actions.callRest(context, {
            endpoint: 'ORDS/postCommonValidation',
            headers: {
              'x-app-code': appCode,
              'x-session-id': $variables.pNavId,
            },
          });

          if (!validationResponse?.ok) {
            throw new Error('Common validation failed');
          }

          if (validationResponse.body.P_ERR_CODE === 'E') {
            throw new Error(validationResponse.body.P_ERR_MSG);
          }

          const processCode = validationResponse.body.P_PROCESS_CODE;
          console.log('✅ Process Code:', processCode);

          // ============================================
          // STEP 4: Get User Details for PCS Submit
          // ============================================
          console.log('Step 4: Getting user details for PCS submission...');

          const encryptedUserEmail = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $application.constants.appType === "LOCAL_DEV" 
                ? $application.constants.developerUser 
                : $application.user.email,
            },
          });

          // --- Get employee details ---
          const userResponse = await Actions.callRest(context, {
            endpoint: 'ORDS/getApprovalProcessUserDtl',
            uriParams: {},
            headers: {
              'x-session-user-mail': encryptedUserEmail,
            },
          });

          if (!userResponse?.ok) {
            throw new Error('Employee details not found');
          }

          if (userResponse?.body?.count === 0) {
            throw new Error('User detail is not found. Please contact the administrator.');
          }

          const personId = userResponse.body.items[0].person_id;
          console.log('✅ User Person ID:', personId);

          // ============================================
          // STEP 5: PCS Submit (Direct)
          // ============================================
          console.log('Step 5: Submitting directly to PCS...');

          // --- Get PCS configuration ---
          const approvalProcess = new ApprovalProcess();
          const config = approvalProcess.getConfig($application.constants.appType);
          const {
            callSubmitPackage,
            applicationName,
            applicationVersion,
            processName,
          } = config[$constants.apprProcess];

          console.log('PCS Config:', {
            callSubmitPackage,
            applicationName,
            applicationVersion,
            processName,
          });

          // --- Determine submission type ---
          const submissionType = $variables.serviceSpecVar.status_code === 'RIA' ? 'MORE_INFO' : 'INITIAL';

          // --- Build PCS submit body ---
          const pcsSubmitBody = {
            params: {
              applicationName: applicationName,
              processName: processName,
              applicationVersion: applicationVersion,
            },
            dataObject: {
              startFormArgs: {
                p_PACKAGE_CALL: callSubmitPackage,
                p_appr_process: processCode,
                p_TRX_ID: $flow.variables.updateActionObj.p_trx_id,
                p_PERSON_ID: personId,
                p_ACTION_ID: $flow.variables.updateActionObj.p_action_id,
                p_TYPE: submissionType,
              },
            },
          };

          console.log('PCS Submit Body:', JSON.stringify(pcsSubmitBody, null, 2));

          // --- PCS Submit REST call ---
          const pcsSubmitResponse = await Actions.callRest(context, {
            endpoint: 'ProcessApi/submitForApproval',
            body: pcsSubmitBody,
          });

          if (!pcsSubmitResponse?.ok) {
            throw new Error('PCS submission failed');
          }

          console.log('✅ PCS Submit Response:', pcsSubmitResponse.body);

          // ============================================
          // STEP 6: Refresh Page Data
          // ============================================
          await Actions.callChain(context, {
            chain: 'vbAfterNavigateListener',
          });

          // ============================================
          // STEP 7: Success Notification
          // ============================================
          await Actions.fireNotificationEvent(context, {
            summary: 'RPA Completed Successfully',
            message: 'Request returned to previous approver successfully',
            type: 'confirmation',
            displayMode: 'transient',
          });

          // ============================================
          // STEP 8: Close Dialogs and Navigate Back
          // ============================================
          await Actions.callComponentMethod(context, {
            selector: '#rpaDialog',
            method: 'close',
          });

          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close',
          });

          await Actions.navigateBack(context, {});

        } catch (error) {
          console.error('❌ RPA Flow Error:', error);
          console.error('Error Stack:', error.stack);
          console.error('updateActionObj State:', JSON.stringify($flow.variables.updateActionObj, null, 2));

          await Actions.callComponentMethod(context, {
            selector: '#rpaDialog',
            method: 'close',
          });

          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close',
          });
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Error in RPA Process',
            message: error.message || 'Unknown error occurred. Please contact administrator.',
            type: 'error',
            displayMode: 'persist',
          });

        } finally {
          // Reset RPA-specific variables
          await Actions.resetVariables(context, {
            variables: [
              '$flow.variables.updateActionObj.p_to_person_id',
              '$flow.variables.responseComments'
            ]
          });
        }

      } else {
        // ❌ Validation failed
        await $functions.handleValidationError($flow.variables.actionValidation.rpaValidation);
      }
    }
  }

  return onClickRpaOkBtn_ACBtn_AC;
});