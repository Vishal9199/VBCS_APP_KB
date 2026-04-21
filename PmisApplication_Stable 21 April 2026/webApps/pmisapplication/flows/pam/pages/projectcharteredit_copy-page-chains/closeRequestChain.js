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

  class closeRequestChain extends ActionChain {

    /**
     * Close Request Chain - Used by Asset Engineering Team to finally approve
     * the request and move to CAPEX team for linking projects
     * 
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const loadingDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#loadingDialog',
        method: 'open',
      });

      try {
        const response = await Actions.callRest(context, {
          endpoint: 'approval/getGetactionbytrxid',
          headers: {
            'p_transaction_id': $variables.projectCharterId,
          },
        });

        if (!response.ok || !response.body.items || response.body.items.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error fetching approval action details',
            type: 'error',
          });

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
          return;
        }

        $variables.updateAction = $variables.updateAction || {};
        $variables.updateAction.P_ACTION_CODE = 'CLOSE_REQUEST';
        $variables.updateAction.P_ACTION_ID = response.body.items[0].action_id;
        $variables.updateAction.P_TRX_ID = $variables.projectCharterId;
        $variables.updateAction.P_INSTANCE_NUMBER = response.body.items[0].approval_instance_num;
        $variables.updateAction.P_APPR_LEVEL = response.body.items[0].approver_level;
        $variables.updateAction.P_ACTION_USER = $application.variables.userLogin;
        $variables.updateAction.P_COMMENTS = 'Request closed and approved. Moving to CAPEX team for linking projects.';

        const updateResponse = await Actions.callRest(context, {
          endpoint: 'approval/postUpdate',
          body: $variables.updateAction,
        });

        if (!updateResponse.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error closing request',
            type: 'error',
          });

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
          return;
        }

        if (updateResponse.body.P_ERROR_CODE === 'S') {
          $variables.putTaskByNumber = $variables.putTaskByNumber || {};
          $variables.putTaskByNumber.comment = 'Request closed and approved. Moving to CAPEX team for linking projects.';
          $variables.putTaskByNumber.outcome = 'CLOSE_REQUEST';

          const pcsResponse = await Actions.callRest(context, {
            endpoint: 'processapi/postV1TasksTaskIdComplete',
            uriParams: {
              taskId: $variables.taskId,
            },
            body: $variables.putTaskByNumber,
          });

          if (!pcsResponse.ok) {
            await Actions.fireNotificationEvent(context, {
              summary: 'PCS Error',
              type: 'error',
            });

            const loadingDialogClose = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });
            return;
          }

          await Actions.fireNotificationEvent(context, {
            summary: 'Request closed successfully. Moving to CAPEX team for linking projects.',
            type: 'confirmation',
            displayMode: 'persist',
          });

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });

          await Actions.navigateBack(context, {
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: updateResponse.body.P_ERROR_MSG || 'Error closing request',
            type: 'error',
          });

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        }
      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: 'An error occurred while closing the request',
          type: 'error',
        });

        const loadingDialogClose = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });
      }
    }
  }

  return closeRequestChain;
});