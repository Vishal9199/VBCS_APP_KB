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

  class navigateToPlanCreate extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (!$variables.selectedPlanType) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please select a plan type before proceeding.',
          type: 'warning',
          displayMode: 'transient',
        });
        return;
      }

      await Actions.callComponentMethod(context, {
        selector: '#createPlanTypeDialog',
        method: 'close',
      });

      let temp_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: '0',
        },
      });

      if ($variables.selectedPlanType === 'FIVE_YEAR') {
        await Actions.navigateToPage(context, {
          page: 'fypedit',
          params: {
            pNavCode: 'CREATE',
            pNavId: temp_key,
          },
        });
      } else if ($variables.selectedPlanType === 'THREE_YEAR') {
        await Actions.navigateToPage(context, {
          page: 'tyedit',
          params: {
            pNavCode: 'CREATE',
            pNavId: temp_key,
          },
        });
      }
    }
  }

  return navigateToPlanCreate;
});