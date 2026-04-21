define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getPmispddLovTenderFetch extends ActionChain {

    async run(context, { configuration }) {

      let searchVal = configuration;

      // Extract search text from LOV fetch
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const callRestEndpoint1 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddLovTenderDtl',
        uriParams: {
          searchVal: searchVal,
        },
        responseBodyFormat: 'json',
      });

      return callRestEndpoint1;
    }
  }

  return getPmispddLovTenderFetch;
});