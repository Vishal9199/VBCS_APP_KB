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

  class RejectSubmitAction extends ActionChain {

    /**
     * Reject Submit Action - Handles rejection submission for Project Charter
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.rejectValid === 'valid') {

        const loadingDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'open',
        });

        const response4 = await Actions.callRest(context, {
          endpoint: 'approval/postUpdate',
          body: $variables.updateAction,
        });

        if (!response4.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Update Action Error.',
            displayMode: 'persist',
            type: 'error',
          });

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } else if (response4.body.P_ERROR_CODE === 'E') {
          await Actions.fireNotificationEvent(context, {
            summary: response4.body.P_ERROR_MSG,
            type: 'error',
          });

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });

          const rejectPopupOpen = await Actions.callComponentMethod(context, {
            selector: '#RejectPopup',
            method: 'open',
          });
        } else if (response4.body.P_ERROR_CODE === 'S') {

          $variables.putTaskByNumber = $variables.putTaskByNumber || {};
          $variables.putTaskByNumber.comment = $variables.updateAction.P_COMMENTS;
          $variables.putTaskByNumber.outcome = 'REJECT';

          const response = await Actions.callRest(context, {
            endpoint: 'processapi/postV1TasksTaskIdComplete',
            uriParams: {
              taskId: $variables.taskId,
            },
            body: $variables.putTaskByNumber,
          });

          if (!response.ok) {
            await Actions.fireNotificationEvent(context, {
              summary: 'PCS Error',
              type: 'error',
            });

            const loadingDialogClose = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });
          } else {
            await Actions.fireNotificationEvent(context, {
              summary: 'Rejected Successfully',
              displayMode: 'persist',
              type: 'confirmation',
            });

            const loadingDialogClose = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });

            const rejectPopupClose = await Actions.callComponentMethod(context, {
              selector: '#RejectPopup',
              method: 'close',
            });

            await Actions.navigateBack(context, {
            });
          }
        } else {
          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        }
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please Select The Required Fields',
          type: 'warning',
        });
      }
    }
  }

  return RejectSubmitAction;
});