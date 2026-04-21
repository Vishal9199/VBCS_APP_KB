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
          'x-session-id': $variables.pTenderId,
        },
      });

      $variables.projectDetailsVar = response.body.items[0];

      $variables.projectDetailsVar.ora_project_id = response.body.items[0].project_id;

      const response2 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddStakeholderGetbytenderid',
        headers: {
          'x-session-id': $variables.pTenderId,
        },
      });

      $variables.ADPStakeholderTable.data = response2.body.items;
    }
  }

  return vbEnterListener;
});
