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

  class moreAction extends ActionChain {

    /**
     * More Action Chain - Handles all approval workflow actions for Project Charter
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

        case 'submit':
          await Actions.callChain(context, {
            chain: 'submitForApprovalAction',
          });
          break;

        case 'approve': {
          const approvePopUpOpen = await Actions.callComponentMethod(context, {
            selector: '#approvePopUp',
            method: 'open',
          });
          await Actions.resetVariables(context, {
            variables: [
              '$page.variables.updateAction',
            ],
          });
          const response6 = await Actions.callRest(context, {
            endpoint: 'approval/getGetactionbytrxid',
            uriParams: {
              'p_transaction_id': $variables.projectCharterId,
            },
          });
          if (response6.ok && response6.body.items && response6.body.items.length > 0) {
            $variables.updateAction.P_ACTION_ID = response6.body.items[0].action_id;
            $variables.updateAction.P_ACTION_CODE = 'APPROVE';
            $variables.updateAction.P_TRX_ID = $variables.projectCharterId;
            $variables.updateAction.P_INSTANCE_NUMBER = response6.body.items[0].approval_instance_num;
            $variables.updateAction.P_APPR_LEVEL = response6.body.items[0].approver_level;
            $variables.updateAction.P_ACTION_USER = $application.variables.userLogin;
          }
          break;
        }

        case 'approval_history':
        case 'approvalHistory': {
          const toApprovalhistory = await Actions.navigateToFlow(context, {
            flow: 'approvalhistoryflownew',
            target: 'parent',
            page: 'approvalhistoryflownew-start',
            params: {
              'p_transaction_id': $variables.projectCharterId,
              'p_appr_request_code': $constants.apprProcess,
            },
          });
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
            uriParams: {
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
          const requireMoreInfoPopupOpen = await Actions.callComponentMethod(context, {
            selector: '#requireMoreInfoPopup',
            method: 'open',
          });
          await Actions.resetVariables(context, {
            variables: [
              '$page.variables.updateAction',
            ],
          });
          const response5 = await Actions.callRest(context, {
            endpoint: 'approval/getGetactionbytrxid',
            uriParams: {
              'p_transaction_id': $variables.projectCharterId,
            },
          });
          if (response5.ok && response5.body.items && response5.body.items.length > 0) {
            $variables.updateAction.P_ACTION_CODE = 'MOREINFO';
            $variables.updateAction.P_ACTION_ID = response5.body.items[0].action_id;
            $variables.updateAction.P_TRX_ID = $variables.projectCharterId;
            $variables.updateAction.P_INSTANCE_NUMBER = response5.body.items[0].approval_instance_num;
            $variables.updateAction.P_APPR_LEVEL = response5.body.items[0].approver_level;
            $variables.updateAction.P_ACTION_USER = $application.user.username;
          }
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
          const reassignPopupOpen = await Actions.callComponentMethod(context, {
            selector: '#ReassignPopup',
            method: 'open',
          });
          await Actions.resetVariables(context, {
            variables: [
              '$page.variables.updateAction',
            ],
          });
          const response3 = await Actions.callRest(context, {
            endpoint: 'approval/getGetactionbytrxid',
            uriParams: {
              'p_transaction_id': $variables.projectCharterId,
            },
          });
          if (response3.ok && response3.body.items && response3.body.items.length > 0) {
            $variables.updateAction.P_ACTION_CODE = 'REASSIGN';
            $variables.updateAction.P_ACTION_ID = response3.body.items[0].action_id;
            $variables.updateAction.P_TRX_ID = $variables.projectCharterId;
            $variables.updateAction.P_INSTANCE_NUMBER = response3.body.items[0].approval_instance_num;
            $variables.updateAction.P_APPR_LEVEL = response3.body.items[0].approver_level;
            $variables.updateAction.P_ACTION_USER = $application.user.username;
            $variables.updateAction.P_FROM_PERSON_ID = $application.variables.getEmployeeDetailTypeVar.user_id;
          }
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
          await Actions.callChain(context, {
            chain: 'initiateAnotherPCChain',
          });
          break;
        }

        case 'closeRequest': {
          await Actions.callChain(context, {
            chain: 'closeRequestChain',
          });
          break;
        }

        default:
          break;
      }
    }
  }

  return moreAction;
});