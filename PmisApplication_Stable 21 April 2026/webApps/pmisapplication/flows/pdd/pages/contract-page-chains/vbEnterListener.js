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


      const response2 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
        headers: {
          'x-session-id': $variables.pTenderId,
        },
      });

      $variables.postContractVar.ora_project_id = response2.body.items[0].project_id;
      $variables.postContractVar.ora_project_name = response2.body.items[0].project_name;
      $variables.postContractVar.ora_project_number = response2.body.items[0].project_number;
      $variables.postContractVar.tender_id = response2.body.items[0].tender_id;
      $variables.postContractVar.tender_name = response2.body.items[0].tender_name;
      $variables.postContractVar.tender_number = response2.body.items[0].tender_number;
      $variables.postContractVar.supplier_id = response2.body.items[0].supplier_id;
      $variables.postContractVar.supplier_name = response2.body.items[0].supplier_name;

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddContractGetbytenderid',
        headers: {
          'x-session-id': $variables.pTenderId,
        },
      });

      if (response.body.count === 0) {
        $variables.pNavCode = 'CREATE';
        $variables.pNavId = '0';
      } else {
         $variables.postContractVar = response.body.items[0];
        $variables.pNavCode = 'EDIT';
        $variables.pNavId = response.body.items[0].contract_id;
      }

    }
  }

  return vbEnterListener;
});
