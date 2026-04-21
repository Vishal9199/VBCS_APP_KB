// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (
//   ActionChain,
//   Actions,
//   ActionUtils
// ) => {
//   'use strict';

//   class onClosePC_AC extends ActionChain {

//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {object} params.event
//      * @param {any} params.originalEvent
//      */
//     async run(context) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//         const currentLevel = $variables.updateAction.P_APPR_LEVEL;

//         const loadingDialogOpen = await Actions.callComponentMethod(context, {
//           selector: '#loadingDialog',
//           method: 'open',
//         });

//         const historyBody = {
//           P_TRX_ID: $variables.projectCharterId,
//           P_LEVEL: $variables.selectedApprovalGroup.p_appr_level || 0,
//           P_APPR_USER_ID: $variables.updateAction.P_NEXT_APPROVER_ID,
//           P_ACTION_ID: $variables.updateAction.P_ACTION_ID,
//         };

//         const response6 = await Actions.callRest(context, {
//             endpoint: 'approval/getGetactionbytrxid',
//             headers: {
//               'p_transaction_id': $variables.projectCharterId,
//             },
//           });
//           if (response6.ok && response6.body.items && response6.body.items.length > 0) {
//             $variables.updateAction.P_ACTION_ID = response6.body.items[0].action_id;
//             $variables.updateAction.P_ACTION_CODE = 'APPROVE';
//             $variables.updateAction.P_TRX_ID = $variables.projectCharterId;
//             $variables.updateAction.P_INSTANCE_NUMBER = response6.body.items[0].approval_instance_num;
//             $variables.updateAction.P_APPR_LEVEL = response6.body.items[0].approver_level;
//             $variables.updateAction.P_ACTION_USER = $application.user.email;
//             $variables.updateAction.P_ACTION_USER_IDCS = $application.user.userId;
//           }

//         const historyResponse = await Actions.callRest(context, {
//           endpoint: 'approval/postUpdateHistory',
//           body: historyBody,
//         });

//         if (!historyResponse.ok || historyResponse.body.P_ERROR_CODE === 'E') {
//           await Actions.fireNotificationEvent(context, {
//             summary: historyResponse.body?.P_ERROR_MSG || 'Update History Error.',
//             displayMode: 'transient',
//             type: 'error',
//           });

//           const loadingDialogClose = await Actions.callComponentMethod(context, {
//             selector: '#loadingDialog',
//             method: 'close',
//           });
//           return;
//         }

//         const response4 = await Actions.callRest(context, {
//           endpoint: 'approval/postUpdate',
//           body: $variables.updateAction,
//         });

//         if (!response4.ok) {
//           await Actions.fireNotificationEvent(context, {
//             summary: 'Update Action Error.',
//             displayMode: 'persist',
//             type: 'error',
//           });

//           const loadingDialogClose = await Actions.callComponentMethod(context, {
//             selector: '#loadingDialog',
//             method: 'close',
//           });
//         } else if (response4.body.P_ERROR_CODE === 'E') {
//           await Actions.fireNotificationEvent(context, {
//             summary: response4.body.P_ERROR_MSG,
//             type: 'error',
//           });

//           const loadingDialogClose = await Actions.callComponentMethod(context, {
//             selector: '#loadingDialog',
//             method: 'close',
//           });

//           const approvepopupOpen2 = await Actions.callComponentMethod(context, {
//             selector: '#approvePopUp',
//             method: 'open',
//           });
//         } else if (response4.body.P_ERROR_CODE === 'S') {

//           $variables.putTaskByNumber = $variables.putTaskByNumber || {};
//           $variables.putTaskByNumber.comment = $variables.updateAction.P_COMMENTS;
//           $variables.putTaskByNumber.outcome = 'APPROVE';

//           const response = await Actions.callRest(context, {
//             endpoint: 'processapi/postV1TasksTaskIdComplete',
//             uriParams: {
//               taskId: $variables.taskId,
//             },
//             body: $variables.putTaskByNumber,
//           });

//           if (!response.ok) {
//             await Actions.fireNotificationEvent(context, {
//               summary: 'PCS Error',
//               type: 'error',
//             });

//             const loadingDialogClose = await Actions.callComponentMethod(context, {
//               selector: '#loadingDialog',
//               method: 'close',
//             });
//           } else {
//             await Actions.fireNotificationEvent(context, {
//               summary: 'Project Charter Closed Successfully',
//               displayMode: 'persist',
//               type: 'confirmation',
//             });

//             const loadingDialogClose = await Actions.callComponentMethod(context, {
//               selector: '#loadingDialog',
//               method: 'close',
//             });

//             const approvePopUpClose = await Actions.callComponentMethod(context, {
//               selector: '#approvePopUp',
//               method: 'close',
//             });

//             await Actions.navigateBack(context, {
//             });
//           }
//         } else {
//           const loadingDialogClose = await Actions.callComponentMethod(context, {
//             selector: '#loadingDialog',
//             method: 'close',
//           });
//         }
//     }
//   }

//   return onClosePC_AC;
// });

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

  class onClosePC_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

        const loadingDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'open',
        });

        const response6 = await Actions.callRest(context, {
            endpoint: 'approval/getGetactionbytrxid',
            headers: {
              'p_transaction_id': $variables.projectCharterId,
            },
          });
          if (response6.ok && response6.body.items && response6.body.items.length > 0) {
            $variables.updateAction.P_ACTION_ID = response6.body.items[0].action_id;
            $variables.updateAction.P_ACTION_CODE = 'APPROVE';
            $variables.updateAction.P_TRX_ID = $variables.projectCharterId;
            $variables.updateAction.P_INSTANCE_NUMBER = response6.body.items[0].approval_instance_num;
            $variables.updateAction.P_APPR_LEVEL = response6.body.items[0].approver_level;
            $variables.updateAction.P_ACTION_USER = $application.user.email;
            $variables.updateAction.P_ACTION_USER_IDCS = $application.user.userId;
          }

        const currentLevel = $variables.updateAction.P_APPR_LEVEL;

        const historyBody = {
          P_TRX_ID: $variables.projectCharterId,
          P_LEVEL: $variables.selectedApprovalGroup?.p_appr_level || (currentLevel + 1),
          P_APPR_USER_ID: $variables.updateAction.P_NEXT_APPROVER_ID,
          P_ACTION_ID: $variables.updateAction.P_ACTION_ID,
        };

        const historyResponse = await Actions.callRest(context, {
          endpoint: 'approval/postUpdateHistory',
          body: historyBody,
        });

        if (!historyResponse.ok || historyResponse.body.P_ERROR_CODE === 'E') {
          await Actions.fireNotificationEvent(context, {
            summary: historyResponse.body?.P_ERROR_MSG || 'Update History Error.',
            displayMode: 'transient',
            type: 'error',
          });

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
          return;
        }

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

          const approvepopupOpen2 = await Actions.callComponentMethod(context, {
            selector: '#approvePopUp',
            method: 'open',
          });
        } else if (response4.body.P_ERROR_CODE === 'S') {

          $variables.putTaskByNumber = $variables.putTaskByNumber || {};
          $variables.putTaskByNumber.comment = $variables.updateAction.P_COMMENTS || 'Closed Project Charter';
          $variables.putTaskByNumber.outcome = 'APPROVE';

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
              summary: 'Project Charter Closed Successfully',
              displayMode: 'persist',
              type: 'confirmation',
            });

            const loadingDialogClose = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });

            const approvePopUpClose = await Actions.callComponentMethod(context, {
              selector: '#approvePopUp',
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
    }
  }

  return onClosePC_AC;
});