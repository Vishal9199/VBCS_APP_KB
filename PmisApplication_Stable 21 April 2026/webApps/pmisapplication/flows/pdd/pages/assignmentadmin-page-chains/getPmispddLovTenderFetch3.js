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

  class getPmispddLovTenderFetch3 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {

      let searchVal2 = configuration;

      // Extract search text from LOV fetch
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const callRestEndpoint1 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddLovTender',
        uriParams: {
          searchVal: searchVal2
        }
      });

      return callRestEndpoint1;
    }
  }

  return getPmispddLovTenderFetch3;
});