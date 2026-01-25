define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/approvalProcess',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ApprovalProcess,
  ActionUtils
) => {
  'use strict';

  class onClickTransactionLog extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let lv_transaction_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.postPayloadTypeVar.strategy_hdr_id,
        },
      });

      const approvalProcess = new ApprovalProcess();
      let config = await approvalProcess.getConfig($application.constants.appType);


      await Actions.openUrl(context, {
        url: config[$constants.apprProcess].transactionLogUrl,
        params: {
          'sessionId': lv_transaction_id
        },
      });

    }
  }

  return onClickTransactionLog;
});
