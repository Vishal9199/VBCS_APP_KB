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

  class getNws_custPettyCashLovSupplierFetch extends ActionChain {

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
          endpoint: 'ORDS/getNws_custPettyCashLovSupplier',
          uriParams: {
            'p_governate': $variables.payload.governorate,
            'searchVal': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          }
        });

        if (!response.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error fetching supplier data',
            message: `Status: ${response.status}`,
            displayMode: 'transient',
            type: 'error',
          });
        } else {
          return response;
        }
      } else {
        // No filter - fetch all records for the selected governorate
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'ORDS/getNws_custPettyCashLovSupplier',
          uriParams: {
            'p_governate': $variables.payload.governorate,
            searchVal: configuration,
          }
        });

        if (!callRestEndpoint1.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error fetching supplier data',
            message: `Status: ${callRestEndpoint1.status}`,
            displayMode: 'transient',
            type: 'error',
          });
        } else {
          return callRestEndpoint1;
        }
      }
    }
  }

  return getNws_custPettyCashLovSupplierFetch;
});