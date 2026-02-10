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

  class secondary_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {string} params.secondaryItem
     * @param {string} params.actionId
     */
    async run(context, { event, secondaryItem, actionId }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      switch (actionId) {
        case 'save': {
          await Actions.callChain(context, {
            chain: 'onHdrSaveAction',
          });
          break;
        }
        case 'saveClose': {
          let isSaveClose = await Actions.callChain(context, {
            chain: 'onHdrSaveAction',
          });

          console.log(
            '%cSave Status: ' + isSaveClose.status,
            'color: white; background: #4CAF50; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
          );


          if(isSaveClose.status === 'S') {
            await Actions.navigateBack(context, {
            });
          }
          break;
        }
        case 'submit': {
          // if ($variables.formValid === 'valid') {
          const submitDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#submitDialog',
            method: 'open',
          });
          break;
        }
        case 'withdraw': {
          const withdrawDialogOpen2 = await Actions.callComponentMethod(context, {
            selector: '#withdrawDialog',
            method: 'open',
          });

          await Actions.resetVariables(context, {
            variables: [
              '$flow.variables.updateActionObj',
            ],
          });

          const response = await Actions.callRest(context, {
            endpoint: 'PAM/getCommonProcessSecActionList',
            headers: {
              'x-session-id': $variables.pNavId,
            },
          });

          if (response.body.count === 1) {

            $flow.variables.updateActionObj.p_action_id = String(response.body.items[0].action_id);
            $flow.variables.updateActionObj.p_action_user_email = $application.user.email;
            $flow.variables.updateActionObj.p_approver_idcs_id = $application.user.userId;
            $flow.variables.updateActionObj.p_action_code = 'WITHDRAW';
            $flow.variables.updateActionObj.p_appr_level = String(response.body.items[0].approver_level);
            $flow.variables.updateActionObj.p_instance_number = response.body.items[0].approval_instance_num;
            $flow.variables.updateActionObj.p_comments = $variables.responseComment; // From dialog

            const withdrawDialogOpen = await Actions.callComponentMethod(context, {
              selector: '#withdrawDialog',
              method: 'open',
            });
          } else {
            await Actions.fireNotificationEvent(context, {
              summary: 'Error in Withdrawal. Please contact administrator',
            });

          }
          break;
        }
        case 'reassign': {
          const reassignDialogOpen2 = await Actions.callComponentMethod(context, {
            selector: '#ReassignDialog',
            method: 'open',
          });

          await Actions.resetVariables(context, {
            variables: [
              '$flow.variables.updateActionObj',
            ],
          });

          const response = await Actions.callRest(context, {
            endpoint: 'PAM/getCommonProcessSecActionList',
            headers: {
              'x-session-id': $variables.pNavId,
            },
          });

          if (response.body.count === 1) {

            // ✅ Basic action info with string conversion
            $flow.variables.updateActionObj.p_action_id = String(response.body.items[0].action_id);
            $flow.variables.updateActionObj.p_action_code = 'REASSIGN';
            // ✅ Current approver info
            $flow.variables.updateActionObj.p_action_user_email = $application.user.email;
            $flow.variables.updateActionObj.p_appr_level = String(response.body.items[0].approver_level);
            // This should come from your employee selection dialog
            $flow.variables.updateActionObj.p_to_person_id = String($flow.variables.updateActionObj.p_to_person_id);
            $flow.variables.updateActionObj.p_instance_number = response.body.items[0].approval_instance_num;
            // $flow.variables.updateActionObj.p_comments = $flow.variables.responseComments || 'Reassigned to another approver';

            const reassignDialogOpen = await Actions.callComponentMethod(context, {
              selector: '#ReassignDialog',
              method: 'open',
            });
          } else {
            await Actions.fireNotificationEvent(context, {
              summary: 'Error in Reassign. Please contact administrator',
            });
          }
          break;
        }
        case 'requireMoreInfo': {
          const moreinfoDialogOpen2 = await Actions.callComponentMethod(context, {
            selector: '#moreinfoDialog',
            method: 'open',
          });

          await Actions.resetVariables(context, {
            variables: [
              '$flow.variables.updateActionObj',
            ],
          });

          const response = await Actions.callRest(context, {
            endpoint: 'PAM/getCommonProcessSecActionList',
            headers: {
              'x-session-id': $variables.pNavId,
            },
          });

          if (response.body.count === 1) {

            // Build payload
            $flow.variables.updateActionObj.p_action_id = response.body.items[0].action_id;
            $flow.variables.updateActionObj.p_action_code = 'MOREINFO';
            $flow.variables.updateActionObj.p_action_user_email = $application.user.email;
            $flow.variables.updateActionObj.p_approver_idcs_id = $application.user.userId;
            $flow.variables.updateActionObj.p_appr_level = response.body.items[0].approver_level;
            $flow.variables.updateActionObj.p_instance_number = response.body.items[0].approval_instance_num;
            // $flow.variables.updateActionObj.p_instance_number = String(response.body.items[0].approval_instance_num);

            // ✅ Transfer comments from dialog to payload
            $flow.variables.updateActionObj.p_comments = $flow.variables.responseComments;

            const moreinfoDialogOpen = await Actions.callComponentMethod(context, {
              selector: '#moreinfoDialog',
              method: 'open',
            });
          } else {
            await Actions.fireNotificationEvent(context, {
              summary: 'Error in Withdrawal. Please contact administrator',
            });

          }
          break;
        }
        case 'apprMoreInfo': {
          // Reset RPA-specific variables
          await Actions.resetVariables(context, {
            variables: [
              // '$variables.rpaTargetApprover',
              // '$variables.rpaMode',
              '$flow.variables.updateActionObj.p_person_id',
              '$flow.variables.responseComments'
            ]
          });

          // Get action details and store in updateActionObj
          const response = await Actions.callRest(context, {
            endpoint: 'PAM/getCommonProcessSecActionList',
            headers: {
              'x-session-id': $variables.pNavId,
            },
          });

          if (response.ok && response.body) {
            // const actionData = response.body;

            // Populate updateActionObj with all required details
            $flow.variables.updateActionObj = {
              p_action_id: response.body.items[0].action_id,
              p_action_user_email: $application.user.email, //response.body.items[0].approver_email_id,
              p_action_code: 'RPA', // Will be set per step
              p_comments: $flow.variables.responseComments || "Approver More Info", // Will be filled by user
              p_instance_number: response.body.items[0].approval_instance_num,
              p_approver_idcs_id: $application.user.userId,
              p_more_info_type: 'RPA_DIRECT',
              p_trx_id: response.body.items[0].transaction_id
            };

            console.log('Stored action details in updateActionObj:', $flow.variables.updateActionObj);
          }

          // Open RPA dialog
          await Actions.callComponentMethod(context, {
            selector: '#rpaDialog',
            method: 'open'
          });
          break;
        }
        case 'apprResponseMoreInfo': {

          // Get action details and store in updateActionObj
          const response = await Actions.callRest(context, {
            endpoint: 'PAM/getCommonProcessSecActionList',
            headers: {
              'x-session-id': $variables.pNavId,
            },
          });

          if (response.ok && response.body) {
            // const actionData = response.body;

            // Populate updateActionObj with all required details
            $flow.variables.updateActionObj = {
              p_action_id: response.body.items[0].action_id,
              p_action_user_email: $application.user.email,
              p_action_code: 'RPA_RESPONSE', // Will be set per step
              p_comments: $flow.variables.responseComments || "Approver More Info", // Will be filled by user
              p_instance_number: response.body.items[0].approval_instance_num,
              p_approver_idcs_id: $application.user.userId,
              p_trx_id: response.body.items[0].transaction_id
            };

            console.log('Stored action details in updateActionObj:', $flow.variables.updateActionObj);
          }

          // Open RPA dialog
          const apprResponseDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#apprResponseDialog',
            method: 'open',
          });
          break;
        }
        case 'approve': {
          const approveDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#approveDialog',
            method: 'open',
          });
          break;
        }
        case 'reject': {
          const rejectDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#rejectDialog',
            method: 'open',
          });
          break;
        }
        case 'about': {
          const aboutDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#aboutDialog',
            method: 'open',
          });

          $variables.about.created_by = $variables.serviceSpecVar.created_by;
          $variables.about.created_date = $variables.serviceSpecVar.created_date;
          $variables.about.last_updated_by = $variables.serviceSpecVar.last_updated_by;
          $variables.about.last_updated_date = $variables.serviceSpecVar.last_updated_date;
          $variables.about.last_updated_login = $variables.serviceSpecVar.last_updated_login;
          break;
        }
        case 'approvalHistory': {
          let lv_transaction_id = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              'input': $variables.serviceSpecVar.service_spec_id,
            },
          });

          const approvalProcess = new ApprovalProcess();
          let config = await approvalProcess.getConfig($application.constants.appType);

          await Actions.openUrl(context, {
            url: config[$constants.apprProcess].url,
            params: {
              'lv_transaction_id': lv_transaction_id,
              'lv_title': 'Service Specification',
              'lv_appr_request_code': 'Service Specification',
            },
          });
          break;
        }
        case 'attachment': {


          // REMEMBER TO CHANGE THE CORRECT ENCRYPTION FUNCTION
          // let temp_hdr_id = await $application.functions.encryptJs_Normal($application.constants.secretKey, $variables.postPayloadTypeVar.strategy_hdr_id);
          let temp_hdr_id = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.serviceSpecVar.service_spec_id,
            },
          });

          let enc_applCode = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $constants.stored_Appl_Code,
            },
          });
          const toCommonmodules = await Actions.navigateToFlow(context, {
            flow: 'commonmodules',
            target: 'parent',
            page: 'attachment',
            params: {
              'P_APPLICATION_CODE': enc_applCode,
              'P_TRANSACTION_ID': temp_hdr_id,
              'P_SCREEN_NAME': 'Service Specification',
            },
          });
          // }
          break;
        }
        
        default:
          break;
      }
    }
  }

  return secondary_AC;
});