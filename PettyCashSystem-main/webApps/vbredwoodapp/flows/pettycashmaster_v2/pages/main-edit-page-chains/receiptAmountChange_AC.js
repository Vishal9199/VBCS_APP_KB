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

  class receiptAmountChange_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {number} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     */
    async run(context, { event, previousValue, value, updatedFrom }) {
      const { $page, $flow, $application, $constants, $variables } = context;
      $variables.receiptLineForm.amount_in_omr = $variables.receiptLineForm.amount * $variables.receiptLineForm.exchange_rate;

      if (value !== null && value !== 'undefined') {
      }
    }
  }

  return receiptAmountChange_AC;
});
