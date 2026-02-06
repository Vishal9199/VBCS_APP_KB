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

  class getLookupTypeLovTypeNameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'AOL/getLookupTypeLovTypeName',
          responseType: 'getLookupTypeLovTypeNameResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
            'p_lookup_prefix': 'PMIS',
          },
        });

        return callRestEndpoint1;
      } else {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'AOL/getLookupTypeLovTypeName',
          responseType: 'getLookupTypeLovTypeNameResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          uriParams: {
            'p_lookup_prefix': 'PMIS',
          },
        });

        return callRestEndpoint1;
      }
    }

  }

  return getLookupTypeLovTypeNameFetch;
});