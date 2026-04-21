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

  class WithdrawOk extends ActionChain {

    /**
     * Withdraw OK Action - Handles withdrawal of Project Charter from approval
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.withdrawValid === 'valid') {

        const loadingDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'open',
        });

        const response = await Actions.callRest(context, {
          endpoint: 'approval/postUpdate',
          body: $variables.updateAction,
        });

        if (!response.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Update API Error',
            type: 'error',
          });

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } else {
          if (response.body.P_ERROR_CODE === 'S') {
            $variables.WithdrawVAR = $variables.WithdrawVAR || { instanceActionProps: {} };
            $variables.WithdrawVAR.action = 'TERMINATE';
            $variables.WithdrawVAR.instanceActionProps.reason = 'Withdrawn';

            const response2 = await Actions.callRest(context, {
              endpoint: 'processapi/putV1InstancesId2',
              uriParams: {
                id: $variables.updateAction.P_INSTANCE_NUMBER,
              },
              body: $variables.WithdrawVAR,
            });

            if (!response2.ok) {
              await Actions.fireNotificationEvent(context, {
                summary: 'PCS API Error',
                type: 'error',
              });

              const loadingDialogClose = await Actions.callComponentMethod(context, {
                selector: '#loadingDialog',
                method: 'close',
              });

              const withdrawPopupOpen = await Actions.callComponentMethod(context, {
                selector: '#withdrawPopup',
                method: 'open',
              });
            } else {
              await Actions.fireNotificationEvent(context, {
                summary: 'Withdrawn Successfully',
                type: 'confirmation',
                displayMode: 'transient',
              });

              const loadingDialogClose = await Actions.callComponentMethod(context, {
                selector: '#loadingDialog',
                method: 'close',
              });

              const withdrawPopupClose = await Actions.callComponentMethod(context, {
                selector: '#withdrawPopup',
                method: 'close',
              });
            }

            await Actions.callChain(context, {
              chain: 'vbAfterNavigateListener',
            });
          } else if (response.body.P_ERROR_CODE === 'E') {
            await Actions.fireNotificationEvent(context, {
              summary: response.body.P_ERROR_MSG,
              type: 'error',
            });

            const loadingDialogClose = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });
          }
        }
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please Select The Required Fields',
          type: 'warning',
        });
      }
    }
  }

  return WithdrawOk;
});