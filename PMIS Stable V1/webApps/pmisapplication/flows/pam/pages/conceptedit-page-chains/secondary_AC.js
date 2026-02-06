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

          $variables.about.created_by = $variables.pamScheduleDetailVar.created_by;
          $variables.about.created_date = $variables.pamScheduleDetailVar.created_date;
          $variables.about.last_updated_by = $variables.pamScheduleDetailVar.last_updated_by;
          $variables.about.last_updated_date = $variables.pamScheduleDetailVar.last_updated_date;
          $variables.about.last_updated_login = $variables.pamScheduleDetailVar.milestone_id;
          break;
        }
        case 'approvalHistory':
          break;

        case 'logDetail':
          break;
        
        default:
          break;
      }
    }
  }

  return secondary_AC;
});