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

  class getCommonLovLookup2Fetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // const callRestEndpoint1 = await Actions.callRest(context, {
      //   endpoint: 'ORDS/getCommonLovLookup2',
      //   responseType: 'getCommonLovLookup2',
      //   hookHandler: configuration.hookHandler,
      //   requestType: 'json',
      // });
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getCommonLovLookup2',
          uriParams: {
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          headers: {
            'p_lookup_type_code': 'STATUS',
          },
        });
 
        if (!response.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: response.status,
          });
        } else {
          return response;
        }
      } else {
 
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'ORDS/getCommonLovLookup2',
          uriParams: {
            searchVal: configuration,
          },
          headers: {
            'p_lookup_type_code': 'STATUS',
          },
        });

        return callRestEndpoint1;
      }
    }
  }

  return getCommonLovLookup2Fetch;
});
