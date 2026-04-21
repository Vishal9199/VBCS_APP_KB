define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
  // 'resources/js/approvalProcess'
], (
  ActionChain,
  Actions,
  ActionUtils
  // ApprovalProcess
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

          await Actions.callChain(context, {
            chain: 'onHdrSaveAction',
          });

          await Actions.navigateBack(context, {
          });
          break;
        }
        case 'about': {
          $variables.about.created_by = $variables.calendarHeaderVar.created_by;
          $variables.about.created_date = $variables.calendarHeaderVar.created_date;
          $variables.about.last_updated_by = $variables.calendarHeaderVar.last_updated_by;
          $variables.about.last_updated_date = $variables.calendarHeaderVar.last_updated_date;
          $variables.about.last_updated_login = $variables.calendarHeaderVar.last_updated_login;

          const aboutDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#aboutDialog',
            method: 'open',
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