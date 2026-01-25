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

  class getApprovalProcessEmployeeListFetch extends ActionChain {

    /**
     * Custom Fetch for Approval Process Employee List
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
        
        console.log('🔍 Employee List - Filtering with text:', 
                    configuration.hookHandler.context.fetchOptions.filterCriterion.text);

        // Call endpoint WITH filter parameter
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getApprovalProcessEmployeeList',
          responseType: 'getApprovalProcessEmployeeListResponse',
          uriParams: {
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          requestType: 'json',
        });

        // Handle error response
        if (!response.ok) {
          console.error('❌ Employee List fetch failed:', response.status);
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Failed to load employee list',
            message: `Error: ${response.status}`,
            displayMode: 'transient',
            type: 'error',
          });

          return response;
        } else {
          console.log('✅ Employee List filtered data loaded');
          return response;
        }

      } else {
        // ===================================================================
        // NO FILTER - Load all employee records (initial load)
        // ===================================================================
        
        console.log('📋 Employee List - Loading all records (no filter)');

        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'ORDS/getApprovalProcessEmployeeList',
          responseType: 'getApprovalProcessEmployeeListResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        console.log('✅ Employee List all data loaded');

        return callRestEndpoint1;
      }
    }
  }

  return getApprovalProcessEmployeeListFetch;
});