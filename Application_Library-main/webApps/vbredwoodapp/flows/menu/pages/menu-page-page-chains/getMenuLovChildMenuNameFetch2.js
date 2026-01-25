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

  class getMenuLovChildMenuNameFetch2 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        // Case when filterCriterion exists
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Menu/getMenuLovChildMenuName',
          uriParams: {
            'p_menu_code': $variables.menuVar.menu_code,
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          responseType: 'getMenuLovChildMenuNameResponse2',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      } else {
        // Case when no filterCriterion exists
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Menu/getMenuLovChildMenuName',
          uriParams: {
            'p_menu_code': $variables.menuVar.menu_code,
          },
          responseType: 'getMenuLovChildMenuNameResponse2',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }
  }

  return getMenuLovChildMenuNameFetch2;
});
