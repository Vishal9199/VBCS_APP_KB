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
 
  class getNws_custPettyCashLovGovernateFetch extends ActionChain {
 
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;
      
      // Check if filter criterion exists (for search/autocomplete functionality)
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getNws_custPettyCashLovGovernate',
          uriParams: {
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          }
        });
 
        if (!response.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error fetching governorate data',
            message: `Status: ${response.status}`,
            displayMode: 'transient',
            type: 'error',
          });
        } else {
          return response;
        }
      } else {
        // No filter - fetch all records
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'ORDS/getNws_custPettyCashLovGovernate',
          uriParams: {
            searchVal: configuration,
          },
        });
 
        return callRestEndpoint1;
      }
    }
  }
 
  return getNws_custPettyCashLovGovernateFetch;
});