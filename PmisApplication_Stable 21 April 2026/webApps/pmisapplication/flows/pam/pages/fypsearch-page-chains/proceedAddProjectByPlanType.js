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

  class proceedAddProjectByPlanType extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (!$variables.addProjectSelectedPlanType) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please select a plan type before proceeding.',
          type: 'warning',
          displayMode: 'transient',
        });
        return;
      }

      await Actions.callComponentMethod(context, {
        selector: '#addProjectPlanTypeDialog',
        method: 'close',
      });

      if ($variables.addProjectSelectedPlanType === 'FIVE_YEAR') {
        // Reset and open the existing Five Year LOV dialog
        await Actions.resetVariables(context, {
          variables: ['$variables.fiveyearPlanvar'],
        });
        await Actions.callComponentMethod(context, {
          selector: '#lovDialog',
          method: 'open',
        });
      } else if ($variables.addProjectSelectedPlanType === 'THREE_YEAR') {
        // Reset and open the Three Year LOV dialog
        await Actions.resetVariables(context, {
          variables: ['$variables.tempThreeyearPlanvar'],
        });
        await Actions.callComponentMethod(context, {
          selector: '#tyLovDialog',
          method: 'open',
        });
      }
    }
  }

  return proceedAddProjectByPlanType;
});