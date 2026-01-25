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

  class getStgScheduleLovScheduleNameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ✅ EXACTLY like the custom fetch stored in memory
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestSearch = await Actions.callRest(context, {
          endpoint: 'SynProcessLog/getStgScheduleLovScheduleName',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestSearch;
      } else {
        const callRestDefault = await Actions.callRest(context, {
          endpoint: 'SynProcessLog/getStgScheduleLovScheduleName',
          responseType: 'getStgScheduleLovScheduleNameResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestDefault;
      }
    }
  }

  return getStgScheduleLovScheduleNameFetch;
});
