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

  class getMenuLovFunctionName2Fetch2 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ✅ Check if filterCriterion is present
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Menu/getMenuLovFunctionName2',
          responseType: 'getMenuLovFunctionName2Response4',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          uriParams: {
            'p_menu_id': $variables.menuVar.menu_id,
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestEndpoint1;

      } else {
        // ✅ Default call (no filter)
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Menu/getMenuLovFunctionName2',
          responseType: 'getMenuLovFunctionName2Response4',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          uriParams: {
            'p_menu_id': $variables.menuVar.menu_id,
          },
        });

        return callRestEndpoint1;
      }
    }
  }

  return getMenuLovFunctionName2Fetch2;
});
