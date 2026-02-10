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

      let key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: '0',
        },
      });

      const toPam = await Actions.navigateToFlow(context, {
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

  return FiveYearPlannavigate;
});
