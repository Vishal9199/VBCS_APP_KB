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

      const response2 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddLessonlearnedGetbytenderid',
        headers: {
          'x-session-id': $application.variables.pTenderId,
        },
      });

      $variables.lessonlearnedADP.data = response2.body.items;

      $variables.projectDetailsVar.ora_project_id = response.body.items[0].project_id;
      $variables.projectDetailsVar.tender_id = response.body.items[0].tender_id;


    }
  }

  return vbEnterListener;
});
