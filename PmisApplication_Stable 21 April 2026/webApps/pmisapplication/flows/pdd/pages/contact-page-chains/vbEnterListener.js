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

      $variables.headerInfoVar.projectName = response2.body.items[0].project_name;
      $variables.headerInfoVar.projectNumber = response2.body.items[0].project_number;
      $variables.headerInfoVar.tenderName = response2.body.items[0].tender_name;
      $variables.headerInfoVar.tenderNumber = response2.body.items[0].tender_number;

      $variables.contactDetailsVar.supplier_id = response2.body.items[0].supplier_id;
      $variables.contactDetailsVar.ora_project_id = response2.body.items[0].project_id;
      $variables.contactDetailsVar.tender_id = response2.body.items[0].tender_id;

      const response3 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddContactGetbytenderid',
        headers: {
          'x-session-id': $variables.pTenderId,
        },
      });

      if (response3.body.count === 0) {
        $variables.pNavCode = 'CREATE';
        $variables.pNavId = '0';
      } else {
         $variables.contactDetailsVar = response3.body.items[0];
        $variables.pNavCode = 'EDIT';
        $variables.pNavId = response3.body.items[0].contact_id;
      }

    }
  }

  return vbEnterListener;
});
