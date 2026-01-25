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

  class getDataRestUserFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ✅ Check if there's a filterCriterion in the fetch options
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {

        // 🔹 Call the REST endpoint with filter parameter (search text)
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'LovModule/getDataRestUser',
          responseType: 'getDataRestUserResponse7',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestEndpoint1;

      } else {

        // 🔹 Call REST without search filter
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'LovModule/getDataRestUser',
          responseType: 'getDataRestUserResponse7',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }
  }

  return getDataRestUserFetch;
});