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

  class getPmispddScheduleLovMilestoneFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let searchVal2 = configuration;

      /* Case 1: Triggered by LOV search typing */
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text || configuration;
      }

      /* REST Call (Works for both initial load & search) */
      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddScheduleLovMilestone',
        uriParams: {
          searchVal: searchVal2
        },
      });

      /* Error Handling */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: response.status,
          message: response.statusText,
          type: 'error'
        });
        return;
      }

      return response;
    }
  }

  return getPmispddScheduleLovMilestoneFetch;
});