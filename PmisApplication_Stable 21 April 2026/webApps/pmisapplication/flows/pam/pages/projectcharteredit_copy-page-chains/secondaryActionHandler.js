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

//   class secondaryActionHandler extends ActionChain {

//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {any} params.actionId
//      * @param {string} params.secondaryItem
//      * @param {string} params.event
//      */
//     async run(context, { actionId, secondaryItem, event }) {
//       const { $page, $variables, $constants, $application, $flow } = context;

//       console.log("Secondary action clicked:", actionId);

//       // Route to appropriate action chain based on button clicked
//       if (secondaryItem === 'submit') {
//         // await Actions.callChain(context, {
//         //   chain: 'submitChain',
//         // });
//       } else if (secondaryItem === 'print') {
//         await Actions.callChain(context, {
//           chain: 'printChain',
//         });
//       } else if ( secondaryItem === 'save' ) {
//         await Actions.callChain(context, {
//           chain: 'saveAndCloseChain',
//           params: {
//             isSaveAndNavigate: 'N',
//           },
//         });
//       } else if ( secondaryItem === 'saveClose' ) {
//         await Actions.callChain(context, {
//           chain: 'saveAndCloseChain',
//           params: {
//             isSaveAndNavigate: 'Y',
//           },
//         });
//       } else if (secondaryItem === 'export') {
//         await Actions.callChain(context, {
//           chain: 'exportChain',
//         });
//       } else if ( secondaryItem === 'attachment' ) {
//         let temp_hdr_id = await Actions.callChain(context, {
//             chain: 'application:encryptAC',
//             params: {
//               input: $variables.projectCharterVar.project_charter_id,
//             },
//           });

//           let enc_applCode = await Actions.callChain(context, {
//             chain: 'application:encryptAC',
//             params: {
//               input: $constants.stored_Appl_Code,
//             },
//           });
//           const toCommonmodules = await Actions.navigateToFlow(context, {
//             flow: 'commonmodules',
//             target: 'parent',
//             page: 'attachment',
//             params: {
//               'P_APPLICATION_CODE': enc_applCode,
//               'P_TRANSACTION_ID': temp_hdr_id,
//               'P_SCREEN_NAME': 'Project Charter',
//             },
//           });
//       } else if (secondaryItem === 'about') {
//         $variables.about.created_by = $variables.projectCharterVar.created_by;
//         $variables.about.created_date = $variables.projectCharterVar.created_date;
//         $variables.about.last_updated_by = $variables.projectCharterVar.last_updated_by;
//         $variables.about.last_updated_date = $variables.projectCharterVar.last_updated_date;
//         $variables.about.last_updated_login = $variables.projectCharterVar.last_updated_login;

//         const aboutDialogOpen = await Actions.callComponentMethod(context, {
//           selector: '#aboutDialog',
//           method: 'open',
//         });

//       } else {
//       }
//     }
//   }

//   return secondaryActionHandler;
// });

define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
  'resources/js/approvalProcess'
], (
  ActionChain,
  Actions,
  ActionUtils,
  ApprovalProcess
) => {
  'use strict';

  class secondaryActionHandler extends ActionChain {

    /**
     * Secondary Action Handler - Handles all approval workflow actions for Project Charter
     * Approval Flow:
     * 1. Asset Planning Manager (Level 1) - can choose CPD GM/OPD GM or Asset Planning General Manager
     * 2. Asset Planning General Manager (Level 2) - can only choose Asset Engineering General Manager
     * 3. Asset Engineering General Manager (Level 3) - can choose CPD GM/OPD GM or Asset Engineering Team
     * 4. Asset Engineering Team - can close request or initiate another PC
     * 5. CPD GM/OPD GM (Level 4) - Final Approver
     * 
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId 
     */
    async run(context, { actionId }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      switch (actionId) {
        case 'about':
          if ($variables.editMode === 'edit') {
            $variables.about.created_by = $variables.projectCharterVar.created_by;
            $variables.about.created_date = $variables.projectCharterVar.created_date;
            $variables.about.last_updated_by = $variables.projectCharterVar.last_updated_by;
            $variables.about.last_updated_date = $variables.projectCharterVar.last_updated_date;
            $variables.about.last_updated_login = $variables.projectCharterVar.last_updated_login;

            const aboutDialogOpen = await Actions.callComponentMethod(context, {
              selector: '#aboutDialog',
              method: 'open',
            });
          }
          break;

        case 'save':
          await Actions.callChain(context, {
            chain: 'saveAndCloseChain',
          });
          break;

        case 'saveClose':
          await Actions.callChain(context, {
            chain: 'saveAndCloseChain',
            params: {
              isSaveAndNavigate: 'Y',
            },
          });
          break;

        case 'submit': {

          const selectFirstApproverOpen = await Actions.callComponentMethod(context, {
            selector: '#selectFirstApprover',
            method: 'open',
          });

          // if($variables.isFirstApproverUpdated = 'Y'){
          //   await Actions.callChain(context, {
          //     chain: 'submitForApprovalAction',
          //   });
          // }
          break;
        }

        // case 'approve': {
        //   const approvePopUpOpen = await Actions.callComponentMethod(context, {
        //     selector: '#approvePopUp',
        //     method: 'open',
        //   });
        //   await Actions.resetVariables(context, {
        //     variables: [
        //       '$page.variables.updateAction',
        //     ],
        //   });
        //   const response6 = await Actions.callRest(context, {
        //     endpoint: 'approval/getGetactionbytrxid',
        //     uriParams: {
        //       'p_transaction_id': $variables.projectCharterId,
        //     },
        //   });
        //   if (response6.ok && response6.body.items && response6.body.items.length > 0) {
        //     $variables.updateAction.P_ACTION_ID = response6.body.items[0].action_id;
        //     $variables.updateAction.P_ACTION_CODE = 'APPROVE';
        //     $variables.updateAction.P_TRX_ID = $variables.projectCharterId;
        //     $variables.updateAction.P_INSTANCE_NUMBER = response6.body.items[0].approval_instance_num;
        //     $variables.updateAction.P_APPR_LEVEL = response6.body.items[0].approver_level;
        //     $variables.updateAction.P_ACTION_USER = $application.variables.userLogin;
        //   }
        //   break;
        // }

        case 'approve': {
          await Actions.resetVariables(context, {
            variables: [
              '$page.variables.updateAction',
              '$page.variables.selectedApprovalGroup',
            ],
          });
          $variables.showApprovalGroupLov = false;
          $variables.selectgroupADP.data = [];

          const response6 = await Actions.callRest(context, {
            endpoint: 'approval/getGetactionbytrxid',
            headers: {
              'p_transaction_id': $variables.projectCharterId,
            },
          });
          if (response6.ok && response6.body.items && response6.body.items.length > 0) {
            const currentLevel = response6.body.items[0].approver_level;
            const appr_request_code = response6.body.items[0].appr_request_code;
            $variables.updateAction.P_ACTION_ID = response6.body.items[0].action_id;
            $variables.updateAction.P_ACTION_CODE = 'APPROVE';
            $variables.updateAction.P_TRX_ID = $variables.projectCharterId;
            $variables.updateAction.P_INSTANCE_NUMBER = response6.body.items[0].approval_instance_num;
            $variables.updateAction.P_APPR_LEVEL = currentLevel;
            $variables.updateAction.P_ACTION_USER = $application.user.email;
            $variables.updateAction.P_ACTION_USER_IDCS = $application.user.userId;

            $variables.stored_level = $variables.updateAction.P_APPR_LEVEL;

            if ((currentLevel === 1 || currentLevel === 3) && appr_request_code === 'PMIS_PROJECT_CHARTER') {
              $variables.showApprovalGroupLov = true;
              const selectgroupResp = await Actions.callRest(context, {
                endpoint: 'approval/getApprovalSelectgroup',
                headers: {
                  p_level: currentLevel,
                },
              });
              $variables.selectgroupADP.data = selectgroupResp.body.items;

              // if (selectgroupResp.ok && selectgroupResp.body.items) {
              //   let filteredItems = [];
              //   if (currentLevel === 1) {
              //     filteredItems = selectgroupResp.body.items.filter(
              //       item => item.level_num === 2 || item.level_num === 5
              //     );
              //   } else if (currentLevel === 3) {
              //     filteredItems = selectgroupResp.body.items.filter(
              //       item => item.level_num === 4 || item.level_num === 5
              //     );
              //   }
              //   $variables.selectgroupADP.data = filteredItems;
              // }
            }
          }

          const approvePopUpOpen = await Actions.callComponentMethod(context, {
            selector: '#approvePopUp',
            method: 'open',
          });
          break;
        }

        case 'generateReport': {
          $variables.postApiVar.REPORT_NAME = 'PMIS_PROJECT_CHARTER';
          $variables.postApiVar.REPORT_PARAMETERS.P_PROJECT_CHARTER_ID = $variables.projectCharterVar.project_charter_id;
          $variables.postApiVar.REPORT_TYPE = 'pdf';

          const progressMsgOpen = await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'open',
          });

          const response3 = await Actions.callRest(context, {
            endpoint: 'RTFReport/postApi',
            body: $variables.postApiVar,
          });

          if (response3.ok && response3.body) {

            const now = new Date();

            // Format: YYYYMMDD_HHMMSS
            const formattedDateTime = now.getFullYear() +
              String(now.getMonth() + 1).padStart(2, '0') +
              String(now.getDate()).padStart(2, '0') + '_' +
              String(now.getHours()).padStart(2, '0') +
              String(now.getMinutes()).padStart(2, '0') +
              String(now.getSeconds()).padStart(2, '0');

            const fileName = `ProjectCharterReport_${formattedDateTime}.pdf`;

            await $functions.downloadFileFromBase64(response3.body.DATA, fileName, 'pdf');

            const progressMsgClose = await Actions.callComponentMethod(context, {
              selector: '#progressMsg',
              method: 'close',
            });
          } else {
            await Actions.fireNotificationEvent(context, {
              summary: 'Failed to fetch report details.',
              displayMode: 'transient',
              type: 'error',
            });

            const progressMsgClose2 = await Actions.callComponentMethod(context, {
              selector: '#progressMsg',
              method: 'close',
            });
          }




          break;
        }

        // case 'approval_history':
        case 'approvalHistory': {
          let lv_transaction_id = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              'input': $variables.projectCharterVar.project_charter_id,
            },
          });

          // const toCommonmodules2 = await Actions.navigateToFlow(context, {
          //   flow: 'commonmodules',
          //   target: 'parent',
          //   page: 'approvalhistory',
          //   params: {
          //     'lv_transaction_id': lv_transaction_id,
          //     'lv_title': 'Project Charter',
          //     'lv_appr_request_code': 'PMIS_PROJECT_CHARTER',
          //   },
          // });

          const toCommonmodules3 = await Actions.navigateToFlow(context, {
            flow: 'commonmodules',
            target: 'parent',
            page: 'approvalhistorydtl',
            params: {
              'pTrxId': $variables.projectCharterVar.project_charter_id,
              'pScreenName': 'Approval History - Project Charter',
              // 'lv_appr_request_code': 'PMIS_PROJECT_CHARTER',
            },
          });

          // const approvalProcess = new ApprovalProcess();
          // let config = await approvalProcess.getConfig($application.constants.appType);

          // await Actions.openUrl(context, {
          //   url: config[$constants.apprProcess].url,
          //   params: {
          //     'lv_transaction_id': lv_transaction_id,
          //     'lv_title': 'Project Charter',
          //     'lv_appr_request_code': 'PMIS_PROJECT_CHARTER',
          //   },
          // });
          break;
        }

        case 'reject': {
          const rejectPopupOpen = await Actions.callComponentMethod(context, {
            selector: '#RejectPopup',
            method: 'open',
          });
          await Actions.resetVariables(context, {
            variables: [
              '$page.variables.updateAction',
            ],
          });
          const response7 = await Actions.callRest(context, {
            endpoint: 'approval/getGetactionbytrxid',
            uriParams: {
              'p_transaction_id': $variables.projectCharterId,
            },
          });
          if (response7.ok && response7.body.items && response7.body.items.length > 0) {
            $variables.updateAction.P_ACTION_ID = response7.body.items[0].action_id;
            $variables.updateAction.P_ACTION_CODE = 'REJECT';
            $variables.updateAction.P_TRX_ID = $variables.projectCharterId;
            $variables.updateAction.P_INSTANCE_NUMBER = response7.body.items[0].approval_instance_num;
            $variables.updateAction.P_APPR_LEVEL = response7.body.items[0].approver_level;
            $variables.updateAction.P_ACTION_USER = $application.variables.userLogin;
          }
          break;
        }

        case 'withdraw': {
          const withdrawPopupOpen = await Actions.callComponentMethod(context, {
            selector: '#withdrawPopup',
            method: 'open',
          });
          await Actions.resetVariables(context, {
            variables: [
              '$page.variables.updateAction',
            ],
          });
          const response4 = await Actions.callRest(context, {
            endpoint: 'approval/getGetactionbytrxid',
            headers: {
              'p_transaction_id': $variables.projectCharterId,
            },
            requestOptions: {
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            }
          });
          if (response4.ok && response4.body.items && response4.body.items.length > 0) {
            $variables.updateAction.P_ACTION_CODE = 'WITHDRAW';
            $variables.updateAction.P_ACTION_ID = response4.body.items[0].action_id;
            $variables.updateAction.P_TRX_ID = $variables.projectCharterId;
            $variables.updateAction.P_INSTANCE_NUMBER = response4.body.items[0].approval_instance_num;
            $variables.updateAction.P_APPR_LEVEL = response4.body.items[0].approver_level;
            $variables.updateAction.P_ACTION_USER = $application.variables.userLogin;
          }
          break;
        }

        case 'requireMoreInfo': {
          // const requireMoreInfoPopupOpen = await Actions.callComponentMethod(context, {
          //   selector: '#requireMoreInfoPopup',
          //   method: 'open',
          // });
          await Actions.resetVariables(context, {
            variables: [
              '$page.variables.updateAction',
            ],
          });
          const response5 = await Actions.callRest(context, {
            endpoint: 'approval/getGetactionbytrxid',
            headers: {
              'p_transaction_id': $variables.projectCharterId,
            },
          });
          if (response5.ok && response5.body.items && response5.body.items.length > 0) {
            $variables.updateAction_MoreInfo.P_ACTION_CODE = 'MOREINFO';
            $variables.updateAction_MoreInfo.P_MORE_INFO_TYPE = 'RIA';
            $variables.updateAction_MoreInfo.P_ACTION_ID = response5.body.items[0].action_id;
            $variables.updateAction_MoreInfo.P_TRX_ID = $variables.projectCharterId;
            $variables.updateAction_MoreInfo.P_INSTANCE_NUMBER = response5.body.items[0].approval_instance_num;
            $variables.updateAction_MoreInfo.P_APPR_LEVEL = response5.body.items[0].approver_level;
            $variables.updateAction_MoreInfo.P_ACTION_USER = $application.user.email;
            $variables.updateAction_MoreInfo.P_ACTION_USER_IDCS = $application.user.userId;
          }

          const requireMoreInfoPopupOpen = await Actions.callComponentMethod(context, {
            selector: '#requireMoreInfoPopup',
            method: 'open',
          });
          
          break;
        }

        case 'apprMoreInfo': {
          const apprMoreInfoPopupOpen = await Actions.callComponentMethod(context, {
            selector: '#apprMoreInfoPopup',
            method: 'open',
          });
          break;
        }

        case 'apprResponseMoreInfo': {
          const apprResponsePopupOpen = await Actions.callComponentMethod(context, {
            selector: '#apprResponseMoreInfoPopup',
            method: 'open',
          });
          break;
        }

        case 'reassign': {
          // const reassignPopupOpen = await Actions.callComponentMethod(context, {
          //   selector: '#ReassignPopup',
          //   method: 'open',
          // });
          await Actions.resetVariables(context, {
            variables: [
              '$page.variables.updateAction',
            ],
          });
          const response3 = await Actions.callRest(context, {
            endpoint: 'approval/getGetactionbytrxid',
            headers: {
              'p_transaction_id': $variables.projectCharterId,
            },
          });
          if (response3.ok && response3.body.items && response3.body.items.length > 0) {
            $variables.updateAction.P_ACTION_CODE = 'REASSIGN';
            $variables.updateAction.P_ACTION_ID = response3.body.items[0].action_id;
            $variables.updateAction.P_TRX_ID = $variables.projectCharterId;
            $variables.updateAction.P_INSTANCE_NUMBER = response3.body.items[0].approval_instance_num;
            $variables.updateAction.P_APPR_LEVEL = response3.body.items[0].approver_level;
            $variables.updateAction.P_ACTION_USER = $application.user.email;
            $variables.updateAction.P_FROM_PERSON_ID = $application.variables.getEmployeeDetailTypeVar.user_id;
          }

          const reassignPopupOpen = await Actions.callComponentMethod(context, {
            selector: '#ReassignPopup',
            method: 'open',
          });
          break;
        }

        case 'attachment': {
          const attachmentDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#attachmentDialog',
            method: 'open',
          });
          break;
        }

        case 'initiateAnotherPC': {
          const ipcPopupOpen = await Actions.callComponentMethod(context, {
            selector: '#ipcPopup',
            method: 'open',
          });

          // await Actions.callChain(context, {
          //   chain: 'initiateAnotherPCChain',
          // });
          break;
        }

        case 'closeRequest': {
          const closePcPopupOpen = await Actions.callComponentMethod(context, {
            selector: '#closePcPopup',
            method: 'open',
          });

          // await Actions.callChain(context, {
          //   chain: 'closeRequestChain',
          // });
          break;
        }

        default:
          break;
      }
    }
  }

  return secondaryActionHandler;
});