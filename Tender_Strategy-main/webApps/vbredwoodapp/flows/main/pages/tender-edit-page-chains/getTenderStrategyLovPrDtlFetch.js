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

  class getTenderStrategyLovPrDtlFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Check if filter criterion exists (user is searching)
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        
        // Extract search text from filter criterion
        const searchText = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
        
        // Call REST endpoint with search parameter
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getTenderStrategyLovPrDtl',
          uriParams: {
            searchVal: searchText,
          },
        });

        // Handle error response
        if (!response.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error loading PR data: ' + response.status,
            type: 'error',
            displayMode: 'transient',
          });
        } else {
          return response;
        }

      } else {
        
        // No search filter - load all records
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'ORDS/getTenderStrategyLovPrDtl',
        });

        return callRestEndpoint1;
      }
    }
  }

  return getTenderStrategyLovPrDtlFetch;
});