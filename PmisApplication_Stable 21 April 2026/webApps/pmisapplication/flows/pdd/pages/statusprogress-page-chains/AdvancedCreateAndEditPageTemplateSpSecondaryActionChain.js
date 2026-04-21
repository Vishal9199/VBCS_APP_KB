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
            chain: 'saveBtnValidationAC',
          });
          break;
        }
        case 'saveClose': {
          await Actions.callChain(context, {
            chain: 'saveBtnValidationAC',
          });
          await Actions.navigateToPage(context, {
            page: 'search',
          });
          break;
        }
        case 'attachment': {
          if ($variables.pNavCode === 'EDIT' && $variables.pNavId && $variables.pNavId !== '0') {
            let enc_applCode = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: 'STATUS_PROGRESS',
              },
            });

            let progress_id = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: $variables.getStatusprogressbyperiodVar.progress_id,
              },
            });

            const toCommonmodules = await Actions.navigateToFlow(context, {
              flow: 'commonmodules',
              target: 'parent',
              page: 'attachment',
              params: {
                'P_APPLICATION_CODE': enc_applCode,
                'P_TRANSACTION_ID': progress_id,
                'P_SCREEN_NAME': 'Status Progress',
              },
            });
          }
          break; // ← was missing break before!
        }
        case 'withdraw':
          break;
        case 'reassign':
          break; // ← was missing break before!
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