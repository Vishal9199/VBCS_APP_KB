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

  class getNws_custPettycashLovGeographyFetch extends ActionChain {

    /**
     * Custom Fetch Action Chain for Geography LOV
     * Supports text filtering when user types in the select component
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // =====================================================================
      // CHECK IF FILTER CRITERION EXISTS (User typing in select component)
      // =====================================================================
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        
        console.log('🔍 Geography LOV - Filtering with text:', 
                    configuration.hookHandler.context.fetchOptions.filterCriterion.text);

        // Call endpoint WITH filter parameter
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getNws_custPettycashLovGeography',
          responseType: 'getNwsCustPettycashLovGeographyResponse',
          uriParams: {
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          requestType: 'json',
        });

        // Handle error response
        if (!response.ok) {
          console.error('❌ Geography LOV fetch failed:', response.status);
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Failed to load geography',
            message: `Error: ${response.status}`,
            displayMode: 'transient',
            type: 'error',
          });

          return response;
        } else {
          console.log('✅ Geography LOV filtered data loaded');
          return response;
        }

      } else {
        // ===================================================================
        // NO FILTER - Load all geography records (initial load)
        // ===================================================================
        
        console.log('📋 Geography LOV - Loading all records (no filter)');

        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'ORDS/getNws_custPettycashLovGeography',
          responseType: 'getNwsCustPettycashLovGeographyResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        console.log('✅ Geography LOV all data loaded');

        return callRestEndpoint1;
      }
    }
  }

  return getNws_custPettycashLovGeographyFetch;
});