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

  class addLinesBtn_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      

      $variables.claimLineForm.currency = 'OMR';
      $variables.receiptLineForm.currency = 'OMR';
      $variables.claimLineForm.exchange_rate_type = 'Corporate';
      $variables.receiptLineForm.exchange_rate_type = 'Corporate';
      $variables.claimLineForm.exchange_rate = 1;
      $variables.receiptLineForm.exchange_rate = 1;
      $variables.claimLineForm.exchange_rate_date = $application.functions.getSysdate();

      $variables.receiptLineForm.exchange_rate_date = $application.functions.getSysdate();

      if ($variables.selectedTab === 'claimLine') {


        $variables.docTypeVar = 'PC_CLAIM_LINE';

        const claimCreateDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#claimCreateDialog',
          method: 'open',
        });
      } else {
        $variables.docTypeVar = 'PC_RECEIPT_LINE';

        const receiptCreateDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#receiptCreateDialog',
          method: 'open',
        });
      }
    }
  }

  return addLinesBtn_AC;
});