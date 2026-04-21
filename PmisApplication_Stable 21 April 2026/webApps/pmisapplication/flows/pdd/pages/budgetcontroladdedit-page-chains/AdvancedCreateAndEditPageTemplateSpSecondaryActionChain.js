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

  class AdvancedCreateAndEditPageTemplateSpSecondaryActionChain extends ActionChain {

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
            chain: 'onhdrSaveAction',
          });
          break;
        }
        case 'about': {
          $variables.about.created_by = $variables.budgetLinesADP.data[0].created_by;
          $variables.about.created_date = $variables.budgetLinesADP.data[0].created_date;
          $variables.about.last_updated_by = $variables.budgetLinesADP.data[0].last_updated_by;
          $variables.about.last_updated_date = $variables.budgetLinesADP.data[0].last_updated_date;
          $variables.about.last_updated_login = $variables.budgetLinesADP.data[0].last_updated_login;

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

  return AdvancedCreateAndEditPageTemplateSpSecondaryActionChain;
});
