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

  class ThreeYearPlannavigate extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (!$variables.tempThreeyearPlanvar || !$variables.tempThreeyearPlanvar.fy_plan_id) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please select a Three Year Plan before proceeding.',
          type: 'warning',
          displayMode: 'transient',
        });
        return;
      }

      await Actions.callComponentMethod(context, {
        selector: '#tyLovDialog',
        method: 'close',
      });

      let key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: '0',
        },
      });

      await Actions.navigateToFlow(context, {
        flow: 'pam',
        target: 'parent',
        page: 'tyedit',
        params: {
          InputPlanVar: $variables.tempThreeyearPlanvar,
          enterType: 'PROJECT_CREATE',
          pNavCode: 'CREATE',
          pNavId: key,
        },
      });
    }
  }

  return ThreeYearPlannavigate;
});