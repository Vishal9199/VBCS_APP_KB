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

  class onClickMoreInfoOk extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      // ✅ Check if MoreInfo form is valid
      // if ($flow.variables.actionValidation.isMoreInfoFormValid === "valid") {
        try {
          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'open',
          });

          // --- Prepare approval update payload ---
          $flow.variables.updateActionObj.p_comments = $flow.variables.responseComments || '-';

          let enc_payload = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $flow.variables.updateActionObj,
            },
          });

          // --- First REST call ---
          const response = await Actions.callRest(context, {
            endpoint: 'ORDS/postApprovalProcessSecUpdate',
            body: {"payload": enc_payload},
          });

          if (response?.body?.P_ERROR_CODE !== "S") {
            throw new Error('Secondary approval update failed');
          }

          // --- Build Process API body ---
          const terminateBody = {
            action: 'TERMINATE',
            instanceActionProps: {
              reason: $flow.variables.responseComments || '-',
            },
          };

          // --- Second REST call ---
          const response2 = await Actions.callRest(context, {
            endpoint: 'ProcessApi/postProcessApiV1InstancesP_instance_id',
            uriParams: {
              p_instance_id: $flow.variables.updateActionObj.p_instance_number,
            },
            body: terminateBody,
          });

          if (!response2?.ok) {
            throw new Error('Process termination failed');
          }

          // --- Success notification ---
          await Actions.fireNotificationEvent(context, {
            summary: 'More Information Request Submitted Successfully',
            type: 'confirmation',
            displayMode: 'transient',
          });

          // Close MoreInfo dialog if applicable
          await Actions.callComponentMethod(context, {
            selector: '#moreinfoDialog',
            method: 'close',
          });

        await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close',
          });

        await Actions.navigateBack(context, {
        });

        } catch (error) {
          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close',
          });
          await Actions.fireNotificationEvent(context, {
            summary: 'Error in More Info Process. Please contact administrator.',
            detail: error?.message || error,
            type: 'error',
            displayMode: 'transient',
          });
        } finally {
        }

      // } else {

      //   await $functions.handleValidationError($flow.variables.actionValidation.moreInfoValidation);

      // }
    }
  }

  return onClickMoreInfoOk;
});