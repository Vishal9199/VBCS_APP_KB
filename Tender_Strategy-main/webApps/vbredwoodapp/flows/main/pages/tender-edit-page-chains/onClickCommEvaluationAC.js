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

  class onClickTechEvaluationAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const approvalProcess = new ApprovalProcess();
      let config = await approvalProcess.getConfig($application.constants.appType);

      await Actions.openUrl(context, {
        url: config[$constants.apprProcess].evaluationUrl,
        params: {
          'tender_number': $variables.tenderRfqDetailVar.tender_rfq_number,
          'tender_type': 'COMMERCIAL_EVALUATION'
        },
      });
    }
  }

  return onClickTechEvaluationAC;
});
