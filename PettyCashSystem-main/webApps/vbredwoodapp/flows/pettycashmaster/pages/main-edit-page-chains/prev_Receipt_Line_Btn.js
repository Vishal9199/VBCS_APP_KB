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

  class prev_Receipt_Line_Btn extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;
      $variables.SearchObj_ReceiptLine.in_offset = String(
      parseInt($variables.SearchObj_ReceiptLine.in_offset, 10) + parseInt(-$variables.SearchObj_ReceiptLine.in_limit, 10));

      await Actions.callChain(context, {
        chain: 'loadLineTablesAC',
      });
    }
  }

  return prev_Receipt_Line_Btn;
});
