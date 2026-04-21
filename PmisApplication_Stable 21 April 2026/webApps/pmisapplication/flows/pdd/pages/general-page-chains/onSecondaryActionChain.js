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

  class onSecondaryActionChain extends ActionChain {

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

          let saveResult = await Actions.callChain(context, {
            chain: 'onHdrSaveAction',
          });

          if (saveResult === 'S') {

            await Actions.navigateBack(context, {
            });
          }
          break;
        }
        case 'about': {
          $variables.about.created_by = $variables.generalInfoVar.created_by;
          $variables.about.created_date = $variables.generalInfoVar.created_date;
          $variables.about.last_updated_by = $variables.generalInfoVar.last_updated_by;
          $variables.about.last_updated_date = $variables.generalInfoVar.last_updated_date;
          $variables.about.last_updated_login = $variables.generalInfoVar.last_updated_login;

          if($variables.pNavCode === 'EDIT') {
            const aboutDialogOpen = await Actions.callComponentMethod(context, {
              selector: '#aboutDialog',
              method: 'open',
            });
          }
          else {
            console.log("About dialog is available for saved record.");
          }
          break;
        }
        default:
          break;
      }
    }
  }

  return onSecondaryActionChain;
});
