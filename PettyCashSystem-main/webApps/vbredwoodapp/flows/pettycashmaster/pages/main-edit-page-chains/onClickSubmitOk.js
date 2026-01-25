define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/approvalProcess',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ApprovalProcess,
  ActionUtils
) => {
  'use strict';

  class onClickSubmitOkOk extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // --- Open progress dialog ---
        await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'open',
        });

        // --- Encrypt headers ---
        const appCode = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $constants.apprProcess },
        });

        // const sessionId = await Actions.callChain(context, {
        //   chain: 'application:encryptAC',
        //   params: { input: $variables.technicalEvaluationVar.tender_id },
        // });

        // --- Common validation ---
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
          await Actions.fireNotificationEvent(context, {
            summary: validationResponse.body.P_ERR_MSG,
            type: 'error',
          });

          // --- Always close progress dialog ---
          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close',
          });
          return;
        }

        const processCode = validationResponse.body.P_PROCESS_CODE;

        const encryptedUserEmail = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $application.constants.appType === "LOCAL_DEV" ? $application.constants.developerUser : $application.user.email,
          },
        });

        // --- Get employee ---
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

          await Actions.fireNotificationEvent(context, {
            summary: 'User detail is not found. Please contact the administrator.',
          });

          // --- Always close progress dialog ---
          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close',
          });

          return;

        }

        const approvalSubmitBody = {
          p_appr_process: processCode,
          p_person_id: userResponse.body.items[0].person_id,
          p_trx_id: $variables.payload.claim_header_id,
          p_type: $variables.payload.status_code === 'RIA' ? 'MORE_INFO' : 'INITIAL'
        };

        // --- Encrypt submit payload ---
        $variables.encPayload.payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: approvalSubmitBody },
        });

        // --- Approval submit ---
        const submitResponse = await Actions.callRest(context, {
          endpoint: 'ORDS/postApprovalProcessSecSubmit',
          body: $variables.encPayload,
        });

        if (!submitResponse?.ok || submitResponse?.body?.P_ACTION_ID == 0) {
          throw new Error('Error in approval process. Please contact administrator.');
        }

        if (submitResponse.body.P_ERROR_CODE === 'E') {
          await Actions.fireNotificationEvent(context, {
            summary: submitResponse.body.P_ERROR_MSG,
            type: 'error',
          });

          const submitDialogClose = await Actions.callComponentMethod(context, {
            selector: '#submitDialog',
            method: 'close',
          });

          // --- Always close progress dialog ---
          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close',
          });
          return;
        }

        // --- PCS submit ---

        const approvalProcess = new ApprovalProcess();

        const config = approvalProcess.getConfig($application.constants.appType);
        const {
          callSubmitPackage,
          applicationName,
          applicationVersion,
          processName,
        } = config[$constants.apprProcess];

        const pcsSubmitBody = {
          params: {
            applicationName: applicationName,
            processName: processName,
            applicationVersion: applicationVersion,
          },
          dataObject: {
            startFormArgs: {
              p_PACKAGE_CALL: callSubmitPackage,
              p_appr_process: approvalSubmitBody.p_appr_process,
              p_TRX_ID: approvalSubmitBody.p_trx_id,
              p_PERSON_ID: approvalSubmitBody.p_person_id,
              p_ACTION_ID: submitResponse.body.P_ACTION_ID,
              p_TYPE: approvalSubmitBody.p_type,
            },
          },
        };

        const pcsSubmitResponse = await Actions.callRest(context, {
          endpoint: 'ProcessApi/submitForApproval',
          body: pcsSubmitBody,
        });

        if (!pcsSubmitResponse?.ok) {
          throw new Error('PCS submission failed');
        }

        // --- Always close progress dialog ---
        await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'close',
        });

        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener',
        });

        // --- Success ---
        await Actions.fireNotificationEvent(context, {
          summary: 'Request Submitted for Approval',
          type: 'confirmation',
          displayMode: 'transient',
        });

        await Actions.navigateBack(context, {
        });

      } catch (error) {

        const submitDialogClose2 = await Actions.callComponentMethod(context, {
          selector: '#submitDialog',
          method: 'close',
        });
        // --- Always close progress dialog ---
        await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'close',
        });
        await Actions.fireNotificationEvent(context, {
          summary: 'Submission failed. Please contact administrator.',
          type: 'error',
        });
      } finally {
      }
    }
  }

  return onClickSubmitOkOk;
});