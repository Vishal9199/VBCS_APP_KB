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
            chain: 'saveAC',
          });
          break;
        }
        case 'saveClose': {
          await Actions.callChain(context, {
            chain: 'saveAC',
          });

          await Actions.navigateBack(context, {
          });
          break;
        }
        case 'about': {
          const detailsOpen = await Actions.callComponentMethod(context, {
            selector: '#details',
            method: 'open',
          });
          break;
        }
        case 'attachment': {
          // Reload attachments with correct pNavId before opening dialog
          if ($variables.pNavCode === 'EDIT' && $variables.pNavId && $variables.pNavId !== '0') {
            await Actions.callChain(context, {
              chain: 'loadAttachmentAC',
            });
          }

          await Actions.callComponentMethod(context, {
            selector: '#attachmentDialog',
            method: 'open',
          });
          break; // ← was missing break before!
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