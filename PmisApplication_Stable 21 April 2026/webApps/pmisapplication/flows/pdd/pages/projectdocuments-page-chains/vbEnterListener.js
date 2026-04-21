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

  class vbEnterListener extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;


      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
        headers: {
          'x-session-id': $application.variables.pTenderId,
        },
      });

      $variables.projectDetailsVar.project_name = response.body.items[0].project_name;
      $variables.projectDetailsVar.project_number = response.body.items[0].project_number;
      $variables.projectDetailsVar.tender_number = response.body.items[0].tender_number;
      $variables.P_TRANSACTION_ID = response.body.items[0].tender_id;

      await Actions.callChain(context, {
        chain: 'loadDocumentColumns_AC',
      });
    }
  }

  return vbEnterListener;
});
