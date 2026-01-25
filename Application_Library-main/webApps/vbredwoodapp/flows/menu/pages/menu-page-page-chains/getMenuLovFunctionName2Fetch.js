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

  class getMenuLovFunctionName2Fetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        // Case when filterCriterion exists (user searched in LOV)
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Menu/getMenuLovFunctionName2',
          uriParams: {
            'p_menu_id': $variables.menuVar.menu_id,
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          responseType: 'getMenuLovFunctionName2Response',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      } else {
        // Case when no filterCriterion exists (initial LOV load)
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Menu/getMenuLovFunctionName2',
          uriParams: {
            'p_menu_id': $variables.menuVar.menu_id,
          },
          responseType: 'getMenuLovFunctionName2Response',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }
  }

  return getMenuLovFunctionName2Fetch;
});
