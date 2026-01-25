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

  class SmartSearchPageTemplateSpSecondaryActionChain extends ActionChain {

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
        case 'cancel': {
          await Actions.navigateBack(context, {
          });
          break;
        }
        case 'Refresh': {
          await Actions.callChain(context, {
            chain: 'searchAC',
          });
          break;
        }
        default:
          break;
      }
    }
  }

  return SmartSearchPageTemplateSpSecondaryActionChain;
});