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

  class getNws_custCommonLovCurrency2Fetch extends ActionChain {

    /**
     * Custom Fetch Action Chain for Currency LOV
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
        
        console.log('🔍 Currency LOV - Filtering with text:', 
                    configuration.hookHandler.context.fetchOptions.filterCriterion.text);

        // Call endpoint WITH filter parameter
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getNws_custCommonLovCurrency2',
          responseType: 'getNwsCustCommonLovCurrency2Response',
          uriParams: {
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          requestType: 'json',
        });

        // Handle error response
        if (!response.ok) {
          console.error('❌ Currency LOV fetch failed:', response.status);
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Failed to load currencies',
            message: `Error: ${response.status}`,
            displayMode: 'transient',
            type: 'error',
          });

          return response;
        } else {
          console.log('✅ Currency LOV filtered data loaded');
          return response;
        }

      } else {
        // ===================================================================
        // NO FILTER - Load all currencies (initial load)
        // ===================================================================
        
        console.log('📋 Currency LOV - Loading all records (no filter)');

        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'ORDS/getNws_custCommonLovCurrency2',
          responseType: 'getNwsCustCommonLovCurrency2Response',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        console.log('✅ Currency LOV all data loaded');

        return callRestEndpoint1;
      }
    }
  }

  return getNws_custCommonLovCurrency2Fetch;
});