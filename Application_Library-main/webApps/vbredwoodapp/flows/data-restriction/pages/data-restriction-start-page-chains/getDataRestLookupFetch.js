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

  class getDataRestLookupFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Check if a filter criterion exists
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {

        // If yes → pass the filter text as a parameter to the REST endpoint
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'LovModule/getDataRestLookup',
          responseType: 'getDataRestLookupResponse3',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestEndpoint1;

      } else {
        // If no filter criterion → call REST without parameters
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'LovModule/getDataRestLookup',
          responseType: 'getDataRestLookupResponse3',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }
  }

  return getDataRestLookupFetch;
});