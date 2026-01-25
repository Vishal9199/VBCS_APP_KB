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

  class getMenuLovMenuNameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ✅ Check whether the LOV search field has a filterCriterion
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Menu/getMenuLovMenuName',
          responseType: 'getMenuLovMenuNameResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestEndpoint1;

      } else {
        // ✅ Default call (no filterCriterion)
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Menu/getMenuLovMenuName',
          responseType: 'getMenuLovMenuNameResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }
  }

  return getMenuLovMenuNameFetch;
});
