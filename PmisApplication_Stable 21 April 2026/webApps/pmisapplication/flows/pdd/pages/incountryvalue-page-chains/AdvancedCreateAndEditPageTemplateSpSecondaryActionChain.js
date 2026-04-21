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
            chain: 'saveAction',
          });
          break;
        }
        case 'about': {

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
