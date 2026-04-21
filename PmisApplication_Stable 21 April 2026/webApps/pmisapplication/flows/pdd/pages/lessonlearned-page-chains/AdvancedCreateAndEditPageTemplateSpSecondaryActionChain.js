define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils'
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
        case 'save': {
          await Actions.callChain(context, {
            chain: 'saveAC',
          });
          break;
        }
        case 'saveClose': {
          await Actions.callChain(context, {
            chain: 'saveAC',
          });

          const toPdd = await Actions.navigateToFlow(context, {
            flow: 'pdd',
            target: 'parent',
            page: 'general',
          });
          break;
        }
        case 'attachment':
        case 'requireMoreInfo':
          break; // ← was missing break before!
        case 'apprMoreInfo':
          break;
        case 'apprResponseMoreInfo':
          break;
        case 'approve':
          break;
        case 'reject':
          break;
        case 'about': {
          const detailsOpen = await Actions.callComponentMethod(context, {
            selector: '#details',
            method: 'open',
          });
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