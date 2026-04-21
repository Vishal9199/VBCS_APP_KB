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

  class RequireMoreInfoOkAction extends ActionChain {

    /**
     * Require More Info OK Action - Handles request for more information
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const loadingDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#loadingDialog',
        method: 'open',
      });

      if ($variables.requireMoreFormValid === 'valid') {

        const response = await Actions.callRest(context, {
          endpoint: 'approval/postUpdate',
          body: $variables.updateAction,
        });

        if (!response.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Update API Error',
            type: 'error',
          });

          const loadingDialogClose4 = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } else {
          if (response.body.P_ERROR_CODE === 'E') {
            const loadingDialogClose3 = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });

            await Actions.fireNotificationEvent(context, {
              summary: response.body.P_ERROR_MSG,
              type: 'error',
            });
          } else {
            if (response.body.P_ERROR_CODE === 'S') {
              $variables.PCSInstanceUpdate = $variables.PCSInstanceUpdate || { instanceActionProps: {} };
              $variables.PCSInstanceUpdate.action = 'TERMINATE';
              $variables.PCSInstanceUpdate.instanceActionProps.reason = $variables.updateAction.P_COMMENTS;

              const response2 = await Actions.callRest(context, {
                endpoint: 'processapi/putV1InstancesId2',
                uriParams: {
                  id: $variables.updateAction.P_INSTANCE_NUMBER,
                },
                body: $variables.PCSInstanceUpdate,
              });

              if (!response2.ok) {
                const loadingDialogClose2 = await Actions.callComponentMethod(context, {
                  selector: '#loadingDialog',
                  method: 'close',
                });

                await Actions.fireNotificationEvent(context, {
                  summary: 'PCS Error',
                  type: 'error',
                });
              } else {
                await Actions.fireNotificationEvent(context, {
                  summary: 'More Information request submitted successfully.',
                  type: 'confirmation',
                  displayMode: 'transient',
                });

                if ($variables.mailBody) {
                  const response3 = await Actions.callRest(context, {
                    endpoint: 'approval/postMailProjectCharter',
                    body: $variables.mailBody,
                  });
                }

                const loadingDialogClose = await Actions.callComponentMethod(context, {
                  selector: '#loadingDialog',
                  method: 'close',
                });

                await Actions.navigateBack(context, {
                });
              }
            }
          }
        }
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please Select The Required Fields',
          type: 'warning',
        });
        
        const loadingDialogClose5 = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });
      }
    }
  }

  return RequireMoreInfoOkAction;
});