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

  class getFunctionLovFunctionNameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        // With filter criterion
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Function/getFunctionLovFunctionName',
          responseType: 'getFunctionLovFunctionNameResponse3',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestEndpoint1;
      } else {
        // Without filter criterion
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Function/getFunctionLovFunctionName',
          responseType: 'getFunctionLovFunctionNameResponse3',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }
  }

  return getFunctionLovFunctionNameFetch;
});
