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

  class onClickgetProjects extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamFiveyearplandtlGetproject',
        uriParams: {
          'p_fycp_id': $variables.postFypHdrVar.fy_calendar_id,
          'p_mp_cal_id': $variables.postFypHdrVar.mp_calendar_id,
          'p_project_category_code': $variables.postFypHdrVar.project_category_code,
        },
      });

      $variables.fypprojectsADP.data = response.body.items;
    }
  }

  return onClickgetProjects;
});
