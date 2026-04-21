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

      $variables.headerInfoVar.projectName = response.body.items[0].project_name;
      $variables.headerInfoVar.projectNumber = response.body.items[0].project_number;
      $variables.headerInfoVar.tenderNumber = response.body.items[0].tender_number;
      $variables.headerInfoVar.tenderId = response.body.items[0].tender_id;
      $variables.headerInfoVar.oraProjectId = response.body.items[0].project_id;

      const response2 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddWeeklyhighlightsGetbyperiod',
        uriParams: {
          'p_period': $variables.periodName,
        },
      });

      $variables.weeklyHighlightsVar = response2.body.items[0];
    }
  }

  return vbEnterListener;
});
