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

  class initiateAnotherPCChain extends ActionChain {

    /**
     * Initiate Another PC Chain - Used by Asset Engineering Team to create
     * a new Project Charter with a separate approval flow:
     * Level 1: Asset Engineering General Manager
     * Level 2: CPD GM/OPD GM (Final Approver)
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
        $variables.updateAction.P_ACTION_CODE = 'INITIATE_ANOTHER_PC';
        $variables.updateAction.P_ACTION_ID = response.body.items[0].action_id;
        $variables.updateAction.P_TRX_ID = $variables.projectCharterId;
        $variables.updateAction.P_INSTANCE_NUMBER = response.body.items[0].approval_instance_num;
        $variables.updateAction.P_APPR_LEVEL = response.body.items[0].approver_level;
        $variables.updateAction.P_ACTION_USER = $application.variables.userLogin;
        $variables.updateAction.P_COMMENTS = 'Initiating another Project Charter with separate approval flow.';

        const updateResponse = await Actions.callRest(context, {
          endpoint: 'approval/postUpdate',
          body: $variables.updateAction,
        });

        if (!updateResponse.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error initiating new Project Charter',
            type: 'error',
          });

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
          return;
        }

        if (updateResponse.body.P_ERROR_CODE === 'S') {
          $variables.submitProcess = {
            params: {
              applicationName: 'ProjectCharter',
              processName: 'ProjectCharter',
              applicationVersion: '1.0'
            },
            dataObject: {
              startWebFormArgs: {
                callSubmitPackage: 'NO',
                p_APPR_PROCESS: 'ProjectCharter',
                p_TRX_ID: $variables.projectCharterId,
                p_ACTION_ID: updateResponse.body.P_ACTION_ID,
                p_USER_ID: $application.variables.getEmployeeDetailTypeVar?.user_id,
                p_PARENT_TRX_ID: $variables.projectCharterId
              }
            }
          };

          const pcsResponse = await Actions.callRest(context, {
            endpoint: 'processapi/postProcessApiV1Instances',
            body: $variables.submitProcess,
          });

          if (!pcsResponse.ok) {
            await Actions.fireNotificationEvent(context, {
              summary: 'PCS Error while initiating new approval flow',
              type: 'error',
            });

            const loadingDialogClose = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });
            return;
          }

          await Actions.fireNotificationEvent(context, {
            summary: 'New Project Charter approval initiated. Pending approval from Asset Engineering General Manager.',
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
            summary: updateResponse.body.P_ERROR_MSG || 'Error initiating new Project Charter',
            type: 'error',
          });

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        }
      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: 'An error occurred while initiating new Project Charter',
          type: 'error',
        });

        const loadingDialogClose = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
            method: 'close',
        });
      }
    }
  }

  return initiateAnotherPCChain;
});