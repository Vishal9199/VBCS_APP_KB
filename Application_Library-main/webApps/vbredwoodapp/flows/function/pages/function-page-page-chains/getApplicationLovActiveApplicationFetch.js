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

  class getApplicationLovActiveApplicationFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        // Case when filterCriterion exists (search applied)
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Application/getApplicationLovActiveApplication',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          responseType: 'getApplicationLovActiveApplicationResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      } else {
        // Case when no filterCriterion exists (initial/default fetch)
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Application/getApplicationLovActiveApplication',
          responseType: 'getApplicationLovActiveApplicationResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }
  }

  return getApplicationLovActiveApplicationFetch;
});
