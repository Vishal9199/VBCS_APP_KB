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

  class ButtonActionChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let enc_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: key,
        },
      });

      const toBudgetcontroladdedit = await Actions.navigateToPage(context, {
        page: 'budgetcontroladdedit',
        params: {
          pNavCode: 'EDIT',
          pTenderId: $application.variables.pTenderId,
          pNavId: enc_key,
        },
      });
    }
  }

  return ButtonActionChain;
});
