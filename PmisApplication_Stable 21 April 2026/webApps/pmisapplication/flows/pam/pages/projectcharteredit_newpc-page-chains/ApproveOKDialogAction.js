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

//   class ApproveOKDialogAction extends ActionChain {

//     /**
//      * Approve OK Dialog Action - Handles approval submission
//      * Supports multi-level approval with next approver selection:
//      * - Level 1 (Asset Planning Manager): Can choose CPD GM/OPD GM or Asset Planning General Manager
//      * - Level 2 (Asset Planning GM): Can choose Asset Engineering General Manager
//      * - Level 3 (Asset Engineering GM): Can choose CPD GM/OPD GM or Asset Engineering Team
//      * - Level 4 (CPD GM/OPD GM): Final Approver
//      * 
//      * @param {Object} context
//      */
//     async run(context) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       if ($variables.approveValid === 'valid') {

//         const loadingDialogOpen = await Actions.callComponentMethod(context, {
//           selector: '#loadingDialog',
//           method: 'open',
//         });

//         const historyResponse = await Actions.callRest(context, {
//           endpoint: 'approval/postUpdateHistory',
//           body: {
//             P_TRX_ID: $variables.projectCharterId,
//             P_LEVEL: $variables.updateAction.P_APPR_LEVEL,
//             P_APPR_USER_ID: $application.variables.getEmployeeDetailTypeVar?.user_id,
//             P_ACTION_ID: $variables.updateAction.P_ACTION_ID,
//           },
//         });

//         if (!historyResponse.ok || historyResponse.body.P_ERROR_CODE === 'E') {
//           await Actions.fireNotificationEvent(context, {
//             summary: historyResponse.body?.P_ERROR_MSG || 'Update History Error.',
//             displayMode: 'persist',
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

//           if ($variables.updateAction.P_NEXT_APPROVER_ID) {
//             $variables.putTaskByNumber.nextApprover = $variables.updateAction.P_NEXT_APPROVER_ID;
//           }

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
//               summary: 'Approved Successfully',
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
//       } else {
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Please Select The Required Fields',
//           type: 'warning',
//         });
//       }
//     }
//   }

//   return ApproveOKDialogAction;
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

  class ApproveOKDialogAction extends ActionChain {

    /**
     * Approve OK Dialog Action - Handles approval submission
     * Supports multi-level approval with next approver selection:
     * - Level 1 (Asset Planning Manager): Can choose CPD GM/OPD GM or Asset Planning General Manager
     * - Level 2 (Asset Planning GM): Can choose Asset Engineering General Manager
     * - Level 3 (Asset Engineering GM): Can choose CPD GM/OPD GM or Asset Engineering Team
     * - Level 4 (CPD GM/OPD GM): Final Approver
     * 
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.approveValid === 'valid') {

        const currentLevel = $variables.updateAction.P_APPR_LEVEL;

        const loadingDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'open',
        });

        const historyBody = {
          P_TRX_ID: $variables.projectCharterId,
          // P_LEVEL: $variables.updateAction.P_APPR_LEVEL,
          P_LEVEL: $variables.selectedApprovalGroup.p_appr_level || 0,
          // P_APPR_USER_ID: $application.variables.getEmployeeDetailTypeVar?.user_id,
          P_APPR_USER_ID: $variables.updateAction.P_NEXT_APPROVER_ID,
          P_ACTION_ID: $variables.updateAction.P_ACTION_ID,
        };

        if (!$variables.selectedApprovalGroup?.approval_role_code) {
          historyBody.P_LEVEL = $variables.updateAction.P_APPR_LEVEL + 1;
          // historyBody.P_APPROVAL_ROLE_CODE = $variables.selectedApprovalGroup.approval_role_code;
          // historyBody.P_USER_ROLE_ID = $variables.selectedApprovalGroup.user_role_id;
        }

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

        if ($variables.selectedApprovalGroup?.user_role_id) {
          $variables.updateAction.P_NEXT_APPROVER_ID = $variables.selectedApprovalGroup.user_role_id;
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
          $variables.putTaskByNumber.comment = $variables.updateAction.P_COMMENTS;
          $variables.putTaskByNumber.outcome = 'APPROVE';

          if ($variables.updateAction.P_NEXT_APPROVER_ID) {
            $variables.putTaskByNumber.nextApprover = $variables.updateAction.P_NEXT_APPROVER_ID;
          }

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
              summary: 'Approved Successfully',
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
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please Select The Required Fields',
          type: 'warning',
        });
      }
    }
  }

  return ApproveOKDialogAction;
});