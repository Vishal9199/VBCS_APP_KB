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

      // Fetch project details (name, number, tender number)
      const response2 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
        headers: {
          'x-session-id': $variables.pTenderId,
        },
      });

      $variables.projectDetailsVar = response2.body.items[0];

      $variables.pProjectId = response2.body.items[0].project_id;
      $variables.tenderid = response2.body.items[0].tender_id;

      // Fetch header table rows
      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddAttributesGetbytenderid',
        headers: {
          'x-session-id': $variables.pTenderId,
        },
      });
      // ✅ Fix 2: Assign to .data not directly to the variable
      $variables.ADPHeaderTable.data = response.body.items;
    }
  }

  return vbEnterListener;
});