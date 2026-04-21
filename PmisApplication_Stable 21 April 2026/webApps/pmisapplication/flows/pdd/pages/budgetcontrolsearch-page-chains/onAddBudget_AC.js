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

  class onAddBudget_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let enc_p_tender_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.searchObj.p_tender_id,
        },
      });

      let enc_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: '0',
        },
      });

      const toBudgetcontroladdedit = await Actions.navigateToPage(context, {
        page: 'budgetcontroladdedit',
        params: {
          pNavCode: 'CREATE',
          pTenderId: enc_p_tender_id,
          pNavId: enc_key,
        },
      });
    }
  }

  return onAddBudget_AC;
});
