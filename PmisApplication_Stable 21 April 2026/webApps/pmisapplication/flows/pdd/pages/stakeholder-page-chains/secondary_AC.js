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

      // ---- TODO: Add your code here ---- //
      console.log('secondaryItem',secondaryItem)

      switch (secondaryItem) {
        case 'save': {
          await Actions.callChain(context, {
            chain: 'onClickSave',
          });
          break;
        }
        case 'saveClose': {

          await Actions.callChain(context, {
            chain: 'onClickSave',
          });

          const toSearch = await Actions.navigateToPage(context, {
            page: 'search',
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