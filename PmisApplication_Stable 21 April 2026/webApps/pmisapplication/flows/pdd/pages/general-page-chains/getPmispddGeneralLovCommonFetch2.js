define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getPmispddGeneralLovCommonFetch2 extends ActionChain {

    async run(context, { configuration }) {

      let searchVal2 = configuration;

      // Extract search text from LOV fetch
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const callRestEndpoint1 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddGeneralLovCommon',
        uriParams: {
          searchVal: searchVal2,
        },
        headers: {
          'x-session-code': 'SOURCE_OF_FUND',
        },
      });

      return callRestEndpoint1;
    }
  }

  return getPmispddGeneralLovCommonFetch2;
});