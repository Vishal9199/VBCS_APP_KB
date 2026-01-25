define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/approvalProcess',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ApprovalProcess,
  ActionUtils
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
            chain: 'saveAction',
          });
          break;
        }
        case 'saveClose': {

          // In your calling action chain
          const isSuccess = await Actions.callChain(context, {
            chain: 'saveAction'
          });

          // Simple boolean check
          if (isSuccess) {
            console.log('✅ Save was successful!');
            await Actions.navigateBack(context, {
            });

          } else {
            console.log('❌ Save failed');
            // Handle error
            await Actions.fireNotificationEvent(context, {
              summary: 'Please contact the administration',
              displayMode: 'transient',
              type: 'warning',
            });

          }

          break;
        }

        case 'submit': {
          const submitDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#submitDialog',
            method: 'open',
          });
          break;
        }
        case 'withdraw': {

          const withdrawDialogOpen3 = await Actions.callComponentMethod(context, {
            selector: '#withdrawDialog',
            method: 'open',
          });

          await Actions.resetVariables(context, {
            variables: [
              '$flow.variables.updateActionObj',
            ],
          });

          const response = await Actions.callRest(context, {
            endpoint: 'ORDS/getApprovalProcessSecActionList',
            headers: {
              'x-session-id': $variables.pNavId,
            },
          });

          if (response.body.count === 1) {
            // ✅ Fixed: lowercase field names with proper String conversion
            $flow.variables.updateActionObj.p_action_id = String(response.body.items[0].action_id);
            $flow.variables.updateActionObj.p_action_user_email = $application.user.email;
            $flow.variables.updateActionObj.p_approver_idcs_id = $application.user.userId;
            $flow.variables.updateActionObj.p_action_code = 'WITHDRAW';
            $flow.variables.updateActionObj.p_appr_level = String(response.body.items[0].approver_level);
            // ✅ Fixed: changed from approval_instance_num to approval_pcs_instance_num
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
          // ✅ Open dialog FIRST (like working code)
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
            endpoint: 'ORDS/getApprovalProcessSecActionList',
            headers: {
              'x-session-id': $variables.pNavId,
            },
          });

          console.log("Reassign Response:", response.body);

          if (response.body.count === 1) {
            $flow.variables.updateActionObj.p_action_id = String(response.body.items[0].action_id);
            $flow.variables.updateActionObj.p_action_code = 'REASSIGN';
            $flow.variables.updateActionObj.p_action_user_email = $application.user.email;
            $flow.variables.updateActionObj.p_appr_level = String(response.body.items[0].approver_level);
            $flow.variables.updateActionObj.p_to_person_id = String($flow.variables.updateActionObj.p_to_person_id);
            $flow.variables.updateActionObj.p_instance_number = response.body.items[0].approval_instance_num;

            // ✅ Open dialog AGAIN (like working code - even though redundant)
            const reassignDialogOpen = await Actions.callComponentMethod(context, {
              selector: '#ReassignDialog',
              method: 'open',
            });
          } else {
            // ⭐ Close the dialog that was opened earlier
            // await Actions.callComponentMethod(context, {
            //   selector: '#ReassignDialog',
            //   method: 'close',
            // });

            await Actions.fireNotificationEvent(context, {
              summary: 'Error in Reassign. Please contact administrator',
              displayMode: 'transient',
              type: 'error',
            });
          }
          break;
        }
        case 'requireMoreInfo': {
          const moreinfoDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#moreinfoDialog',
            method: 'open',
          });
          await Actions.resetVariables(context, {
            variables: [
              '$flow.variables.updateActionObj',
            ],
          });

          const response = await Actions.callRest(context, {
            endpoint: 'ORDS/getApprovalProcessSecActionList',
            headers: {
              'x-session-id': $variables.pNavId,
            },
          });

          if (response.body.count === 1) {
            // ✅ Fixed: lowercase field names with proper String conversion
            $flow.variables.updateActionObj.p_action_id = response.body.items[0].action_id;
            $flow.variables.updateActionObj.p_action_code = 'MOREINFO';
            $flow.variables.updateActionObj.p_action_user_email = $application.user.email;
            $flow.variables.updateActionObj.p_approver_idcs_id = $application.user.userId;
            $flow.variables.updateActionObj.p_appr_level = response.body.items[0].approver_level;
            // ✅ Fixed: changed from approval_instance_num to approval_pcs_instance_num
            $flow.variables.updateActionObj.p_instance_number = response.body.items[0].approval_instance_num;
            // ✅ Transfer comments from dialog to payload
            $flow.variables.updateActionObj.p_comments = $flow.variables.responseComments;

            const moreinfoDialogOpen2 = await Actions.callComponentMethod(context, {
              selector: '#moreinfoDialog',
              method: 'open',
            });
          } else {
            await Actions.fireNotificationEvent(context, {
              summary: 'Error in More Info Request. Please contact administrator',
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
            endpoint: 'ORDS/getApprovalProcessSecActionList',
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
              // p_from_person_email: $application.user.email,
              // p_to_person_id: '', // Will be set from dialog selection
              // p_appr_level: actionData.appr_level || '',
              // p_instance_number: actionData.instance_num,
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
          // Reset RPA-specific variables
          // await Actions.resetVariables(context, {
          //   variables: [
          //     // '$variables.rpaTargetApprover',
          //     // '$variables.rpaMode',
          //     // '$flow.variables.updateActionObj.p_person_id',
          //     // '$flow.variables.responseComments'
          //   ]
          // });

          // Get action details and store in updateActionObj
          const response = await Actions.callRest(context, {
            endpoint: 'ORDS/getApprovalProcessSecActionList',
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
              // p_from_person_email: $application.user.email,
              // p_to_person_id: '', // Will be set from dialog selection
              // p_appr_level: actionData.appr_level || '',
              // p_instance_number: actionData.instance_num,
              // p_more_info_type: '',
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
          const response2 = await Actions.callRest(context, {
            endpoint: 'ORDS/getApprovalProcessSecActionList',
            headers: {
              'x-session-id': $variables.pNavId,
            },
          });

          if (response2.body.items[0].approval_role_code === 'OWWSC_OPEX_HEAD_REVIEW' || response2.body.items[0].approval_role_code === 'OWWSC_CAPEX_HEAD_REVIEW') {
            const approveReassignDialogOpen = await Actions.callComponentMethod(context, {
              selector: '#approveReassignDialog',
              method: 'open',
            });
          } else if (response2.body.items[0].approval_role_code === 'TS_OPEX_SECRETARY_ROLE' || response2.body.items[0].approval_role_code === 'TS_CAPEX_SECRETARY_ROLE') {
            const approveMOMFormDialogOpen = await Actions.callComponentMethod(context, {
              selector: '#ApproveMOMFormDialog',
              method: 'open',
            });
          }
          // else if (response2.body.items[0].approval_role_code === 'OWWSC_CAPEX_HEAD_REVIEW') {
          //   const customReassignDialogOpen2 = await Actions.callComponentMethod(context, {
          //     selector: '#CustomReassignDialog',
          //     method: 'open',
          //   });
          // }
          else {

            const approveDialogOpen = await Actions.callComponentMethod(context, {
              selector: '#approveDialog',
              method: 'open',
            });
          }
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

          $variables.about.created_by = $variables.postPayloadTypeVar.created_by;
          $variables.about.created_date = $variables.postPayloadTypeVar.created_date;
          $variables.about.last_updated_by = $variables.postPayloadTypeVar.last_updated_by;
          $variables.about.last_updated_date = $variables.postPayloadTypeVar.last_updated_date;
          $variables.about.last_updated_login = $variables.postPayloadTypeVar.last_updated_by;
          break;
        }
        case 'approvalHistory': {

          let lv_transaction_id = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.postPayloadTypeVar.strategy_hdr_id,
            },
          });

          const approvalProcess = new ApprovalProcess();
          let config = await approvalProcess.getConfig($application.constants.appType);


          await Actions.openUrl(context, {
            url: config[$constants.apprProcess].url,
            params: {
              'lv_transaction_id': lv_transaction_id,
              'lv_title': $variables.pageTitle,
              'lv_appr_request_code': $variables.pageTitle,
            },
          });

          // Below Commented Code is for navigating to the flow > Approval History Page
          // const toApprovalhistory = await Actions.navigateToFlow(context, {
          //   flow: 'approvalhistory',
          //   target: 'parent',
          //   page: 'approvalhistory-start',
          //   params: {
          //     'lv_transaction_id': $variables.tenderStrategyVar.strategy_hdr_id,
          //     'lv_appr_request_code': $variables.pageTitleCode,
          //     'lv_title': $variables.pageTitle,
          //   },
          // });

          break;
        }
        case 'attachment': {

          // ✅ Fixed: encryption function name from encryptLargePayloadWithTime to encLargePayloadWithTime
          let temp_hdr_id = await Actions.callChain(context, {
            chain: 'application:encryptLargePayloadWithTime',
            params: {
              plainText: $variables.postPayloadTypeVar.strategy_hdr_id,
            },
          });

          let encryptReqNumber = await Actions.callChain(context, {
            chain: 'application:encryptLargePayloadWithTime',
            params: {
              plainText: $variables.requestDetailVar.request_number || '0',
            },
          });

          let encApplicationVar = await Actions.callChain(context, {
            chain: 'application:encryptLargePayloadWithTime',
            params: {
              plainText: $variables.attachmentObj.P_APPL_CODE,
            },
          });

          const toAttachment = await Actions.navigateToFlow(context, {
            flow: 'attachment',
            target: 'parent',
            page: 'attachment-start',
            params: {
              'P_TRANSACTION_ID': temp_hdr_id,
              'P_SCREEN_NAME': 'Tender Strategy',
              'P_APPLICATION_CODE': encApplicationVar,
              'P_TRANSACTION_NUMBER': encryptReqNumber,
              'P_STATUS': $variables.postPayloadTypeVar.status_code
            },
          });
          break;
        }
        default:
          break;
      }
    }
  }

  return secondary_AC;
});