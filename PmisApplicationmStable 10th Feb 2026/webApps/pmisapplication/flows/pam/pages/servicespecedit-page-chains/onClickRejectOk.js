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

  class onClickRejectOk extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      // ✅ Check if Reject form is valid
      if ($flow.variables.actionValidation.isRejectFormValid === "valid") {
        try {
          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'open',
          });

          // Set comments
          $flow.variables.updateActionObj.p_comments = $flow.variables.responseComments || '-';

          const rejectTaskObj = {
            outcome: "REJECT",
            comment: $flow.variables.responseComments
          };

          const response = await Actions.callRest(context, {
            endpoint: 'ProcessApi/Approve_Reject',
            uriParams: {
              taskId: $variables.taskId,
            },
            body: rejectTaskObj
          });

          if (!response?.ok) {
            throw new Error('Reject REST call failed');
          }

          await Actions.fireNotificationEvent(context, {
            summary: 'Request Rejected Successfully',
            type: 'confirmation',
            displayMode: 'transient',
          });

          await Actions.callComponentMethod(context, {
            selector: '#rejectDialog',
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
            summary: 'Error in Rejection Process. Please contact administrator.',
          });
        } finally {
        }

      } else {

        await $functions.handleValidationError($flow.variables.actionValidation.rejectValidation);

      }
    }
  }

  return onClickRejectOk;
});