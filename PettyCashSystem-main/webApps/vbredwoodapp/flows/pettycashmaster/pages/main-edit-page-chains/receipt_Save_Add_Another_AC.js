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

  class receipt_Save_Add_Another_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.callChain(context, {
        chain: 'save_ReceiptLine_AC',
      });

      await Actions.resetVariables(context, {
        variables: [
    '$variables.receiptLineForm',
  ],
      });
    }
  }

  return receipt_Save_Add_Another_AC;
});
