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

      if ($variables.pNavCode === 'EDIT') {
        await this.loadEditMode(context);
      } else {
        await this.loadCreateMode(context);
      }
    }

    /**
     * @param {Object} context
     */
    async loadEditMode(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.editMode = 'edit';

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamFiveyearplandtlGetbyid',
        headers: {
          'x-session-id': $variables.pNavId,
        },
      });

      $variables.postTypHdrVar = response.body.items[0];

      await Actions.callChain(context, {
        chain: 'typBudgetCostfetch',
      });
    }

    /**
     * @param {Object} context
     */
    async loadCreateMode(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.editMode = 'add';
      $variables.postTypHdrVar.object_version_num = 0;
      $variables.postTypHdrVar.active_flag = 'Y';
      $variables.postTypHdrVar.created_by = $application.user.email;
      $variables.postTypHdrVar.created_date = $application.functions.getSysdate();
      $variables.postTypHdrVar.last_updated_by = $application.user.email;
      $variables.postTypHdrVar.last_updated_date = $application.functions.getSysdate();
      $variables.postTypHdrVar.last_updated_login = $application.user.email;

      if ($variables.enterType === 'PROJECT_CREATE') {
        $variables.postTypHdrVar.fy_plan_id = $variables.InputPlanVar.fy_plan_id;
        $variables.postTypHdrVar.mp_calendar_id = $variables.InputPlanVar.mp_calendar_id;
        $variables.postTypHdrVar.fy_plan_name = $variables.InputPlanVar.fy_plan_name;
        $variables.postTypHdrVar.fy_calendar_id = $variables.InputPlanVar.fy_calendar_id;
      }
    }
  }

  return vbEnterListener;
});