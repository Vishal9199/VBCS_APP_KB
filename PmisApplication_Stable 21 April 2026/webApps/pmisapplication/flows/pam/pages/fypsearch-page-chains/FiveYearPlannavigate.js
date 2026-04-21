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

  class FiveYearPlannavigate extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (!$variables.fiveyearPlanvar || !$variables.fiveyearPlanvar.fy_plan_id) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please select a plan before proceeding.',
          type: 'warning',
          displayMode: 'transient',
        });
        return;
      }

      let key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: '0',
        },
      });

      // Route to the correct edit page based on the plan type selected
      // in the Add Project plan type dialog
      if ($variables.addProjectSelectedPlanType === 'THREE_YEAR') {
        await Actions.navigateToFlow(context, {
          flow: 'pam',
          target: 'parent',
          page: 'tyedit',
          params: {
            InputPlanVar: $variables.fiveyearPlanvar,
            enterType: 'PROJECT_CREATE',
            pNavCode: 'CREATE',
            pNavId: key,
          },
        });
      } else {
        // Default: FIVE_YEAR
        await Actions.navigateToFlow(context, {
          flow: 'pam',
          target: 'parent',
          page: 'fypedit',
          params: {
            InputPlanVar: $variables.fiveyearPlanvar,
            enterType: 'PROJECT_CREATE',
            pNavCode: 'CREATE',
            pNavId: key,
          },
        });
      }
    }
  }

  return FiveYearPlannavigate;
});