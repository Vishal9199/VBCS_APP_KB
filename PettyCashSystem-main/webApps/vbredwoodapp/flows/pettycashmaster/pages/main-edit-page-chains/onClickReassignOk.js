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

  class onClickReassignOk extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      // ✅ Check if Reassign form is valid
      if ($flow.variables.actionValidation.isReassignFormValid === "valid") {
        try {
          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'open',
          });

          // --- Prepare approval update payload ---
          $flow.variables.updateActionObj.p_comments = $flow.variables.responseComments || '-';

          $variables.encPayload.payload = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $flow.variables.updateActionObj,
            },
          });

          // --- First REST call ---
          const response = await Actions.callRest(context, {
            endpoint: 'ORDS/postApprovalProcessSecUpdate',
            body: $variables.encPayload,
          });

          if (response?.body?.P_ERROR_CODE !== "S") {
            throw new Error('Secondary approval update failed');
          }

          // --- Suspend instance REST call ---
          const suspendBody = {
            action: 'SUSPEND',
            instanceActionProps: {
              reason: 'Suspending for performing the alter flow by the system.',
            },
          };

          const response2 = await Actions.callRest(context, {
            endpoint: 'ProcessApi/putProcessSuspend',
            uriParams: {
              'instance_number': $flow.variables.updateActionObj.p_instance_number,
            },
            body: suspendBody,
          });

          if (!response2?.ok || response2?.body?.type !== "ok") {
            throw new Error('Suspend action failed');
          }

          // --- Get current activity ---
          const response3 = await Actions.callRest(context, {
            endpoint: 'ProcessApi/getCurrentActivity',
            uriParams: {
              'p_instance_number': $flow.variables.updateActionObj.p_instance_number,
            },
          });

          if (!response3?.ok || response3?.body?.activities.length === 0) {
            throw new Error('Failed to fetch current activities');
          }

          // --- Get target activities ---
          const response4 = await Actions.callRest(context, {
            endpoint: 'ProcessApi/getTargetActivities',
            uriParams: {
              'p_instance_number': $flow.variables.updateActionObj.p_instance_number,
            },
          });

          if (!response4?.ok || response4?.body?.activities.length === 0) {
            throw new Error('Failed to fetch target activities');
          }

          // --- Complete process API action (ALTER_FLOW) ---
          const alterFlowBody = {
            action: "ALTER_FLOW",
            instanceActionProps: {
              sourceActivityId: response3?.body?.activities[0]?.activityId,
              destinationActivityId: response4?.body?.activities[0]?.activityId,
              reason: "Reassign",
            },
          };

          const response5 = await Actions.callRest(context, {
            endpoint: 'ProcessApi/postProcessApiV1InstancesP_instance_number',
            uriParams: {
              'p_instance_number': $flow.variables.updateActionObj.p_instance_number,
            },
            body: alterFlowBody,
          });

          if (!response5?.ok) {
            throw new Error('Final process API call failed');
          }

          // ✅ Success notification
          await Actions.fireNotificationEvent(context, {
            summary: 'Reassign Completed Successfully',
            type: 'confirmation',
            displayMode: 'transient',
          });

          const reassignDialogClose = await Actions.callComponentMethod(context, {
            selector: '#ReassignDialog',
            method: 'close',
          });
          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close',
          });


          await Actions.navigateBack(context, {
          });


        } catch (error) {

          const reassignDialogClose2 = await Actions.callComponentMethod(context, {
            selector: '#ReassignDialog',
            method: 'close',
          });

          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close',
          });
          await Actions.fireNotificationEvent(context, {
            summary: 'Error in Reassign Process. Please contact administrator.',
          });
        } finally {
        }

      } else {

        await $functions.handleValidationError($flow.variables.actionValidation.reassignValidation);
        
      }
    }
  }

  return onClickReassignOk;
});