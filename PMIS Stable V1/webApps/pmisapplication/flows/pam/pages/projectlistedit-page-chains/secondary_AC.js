define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils'
  // 'resources/js/approvalProcess'
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

      switch (secondaryItem) {
        case 'save': {
          await Actions.callChain(context, {
            chain: 'onHdrSaveAction',
          });
          break;
        }
        case 'saveClose': {
          await Actions.callChain(context, {
            chain: 'onHdrSaveAction',
          });

          await Actions.navigateBack(context, {
          });
          break;
        }
        case 'submit':
        case 'withdraw':
          break;
        case 'reassign': {

        }
        case 'requireMoreInfo': {

        }
        case 'apprMoreInfo':
          break;
        case 'apprResponseMoreInfo':
          break;
        case 'approve':
          break;
        case 'reject':
          break;
        case 'about': {
          const aboutDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#aboutDialog',
            method: 'open',
          });

          $variables.about.created_by = $variables.masterPlanHeaderVar.created_by;
          $variables.about.created_date = $variables.masterPlanHeaderVar.created_date;
          $variables.about.last_updated_by = $variables.masterPlanHeaderVar.last_updated_by;
          $variables.about.last_updated_date = $variables.masterPlanHeaderVar.last_updated_date;
          $variables.about.last_updated_login = $variables.masterPlanHeaderVar.last_updated_login;
          break;
        }
        case 'approvalHistory':
          break;
        case 'attachment': {
          // let temp_hdr_id = await $application.functions.encryptJs_Normal($application.constants.secretKey, $variables.postPayloadTypeVar.strategy_hdr_id);
          let temp_hdr_id = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              plainText: $variables.masterPlanHeaderVar.project_id,
            },
          });

          // let encryptReqNumber = await $application.functions.encryptJs_Normal($application.constants.secretKey, $variables.requestDetailVar.request_number);
          // let encryptReqNumber = await Actions.callChain(context, {
          //   chain: 'application:encryptAC',
          //   params: {
          //     plainText: $variables.requestDetailVar.request_number || '0',
          //   },
          // });
          const toAttachment = await Actions.navigateToFlow(context, {
            flow: 'attachment',
            target: 'parent',
            page: 'attachment-start',
            params: {
              'P_TRANSACTION_ID': temp_hdr_id,
              'P_SCREEN_NAME': 'Project List Admin',
              'P_APPLICATION_CODE': $constants.stored_Appl_Code,
              'P_TRANSACTION_NUMBER': '',
              'P_STATUS': '',
            },
          });
          // }
          break;
        }

        case 'logDetail':
          break;
        
        default:
          break;
      }
    }
  }

  return secondary_AC;
});