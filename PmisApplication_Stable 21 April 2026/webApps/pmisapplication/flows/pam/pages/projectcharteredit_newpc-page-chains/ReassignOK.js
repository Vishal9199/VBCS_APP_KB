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

  class ReassignOK extends ActionChain {

    /**
     * Reassign OK Action - Handles reassignment of approval task
     * Supports reassignment based on approval level:
     * - Level 1: Can reassign to CPD GM/OPD GM or Asset Planning General Manager
     * - Level 2: Can reassign to Asset Engineering General Manager
     * - Level 3: Can reassign to CPD GM/OPD GM or Asset Engineering Team
     * 
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      if ($variables.reassignvalid === 'valid') {

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
            summary: 'Update API error',
            type: 'error',
          });

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } else {
          if (response.body.P_ERROR_CODE === 'S') {

            const response3 = await Actions.callRest(context, {
              endpoint: 'processapi/getV1InstancesInstance_idTargetActivities',
              uriParams: {
                fetchCompleted: 'true',
                'instance_id': $variables.updateAction.P_INSTANCE_NUMBER,
              },
            });

            if (!response3.ok) {
              await Actions.fireNotificationEvent(context, {
                summary: 'Target Activities API Error',
                type: 'error',
              });

              const loadingDialogClose = await Actions.callComponentMethod(context, {
                selector: '#loadingDialog',
                method: 'close',
              });
            } else {

              $variables.PCSInstanceUpdate = $variables.PCSInstanceUpdate || { instanceActionProps: {} };
              $variables.PCSInstanceUpdate.action = 'SUSPEND';
              $variables.PCSInstanceUpdate.instanceActionProps.reason = 'Suspending for performing the alter flow by the system.';

              const response6 = await Actions.callRest(context, {
                endpoint: 'processapi/putV1InstancesId2',
                uriParams: {
                  id: $variables.updateAction.P_INSTANCE_NUMBER,
                },
                body: $variables.PCSInstanceUpdate,
              });

              if ($functions && $functions.constructAlterFlowPayload) {
                const constructAlterFlowPayload = await $functions.constructAlterFlowPayload(response3.body.activities, 'altering flow');

                const response5 = await Actions.callRest(context, {
                  endpoint: 'processapi/putV1InstancesId2',
                  uriParams: {
                    id: $variables.updateAction.P_INSTANCE_NUMBER,
                  },
                  body: constructAlterFlowPayload,
                });

                if (!response5.ok) {
                  await Actions.fireNotificationEvent(context, {
                    summary: 'PCS API Error',
                    type: 'error',
                  });

                  const loadingDialogClose = await Actions.callComponentMethod(context, {
                    selector: '#loadingDialog',
                    method: 'close',
                  });
                } else {
                  await Actions.fireNotificationEvent(context, {
                    summary: 'Reassigned Successfully',
                    type: 'confirmation',
                  });

                  const loadingDialogClose = await Actions.callComponentMethod(context, {
                    selector: '#loadingDialog',
                    method: 'close',
                  });

                  await Actions.navigateBack(context, {
                  });
                }
              } else {
                await Actions.fireNotificationEvent(context, {
                  summary: 'Reassigned Successfully',
                  type: 'confirmation',
                });

                const loadingDialogClose = await Actions.callComponentMethod(context, {
                  selector: '#loadingDialog',
                  method: 'close',
                });

                await Actions.navigateBack(context, {
                });
              }
            }
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
          summary: 'Please Enter the Mandatory Field',
          displayMode: 'transient',
          type: 'warning',
        });
      }
    }
  }

  return ReassignOK;
});