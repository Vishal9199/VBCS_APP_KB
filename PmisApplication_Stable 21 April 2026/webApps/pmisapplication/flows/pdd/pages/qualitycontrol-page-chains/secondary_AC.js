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

  return secondary_AC;
});
