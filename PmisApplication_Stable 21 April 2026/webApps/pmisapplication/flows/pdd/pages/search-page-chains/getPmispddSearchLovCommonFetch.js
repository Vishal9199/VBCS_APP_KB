define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getProjectNameLovCommonFetch extends ActionChain {

    async run(context, { configuration }) {

      let searchVal2 = configuration;

      // Extract search text from LOV fetch
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const callRestEndpoint1 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddSearchLovCommon',
        uriParams: {
          searchVal: searchVal2,
        },
        headers: {
          'x-session-code': 'PROJECT',
        },
      });

      return callRestEndpoint1;
    }
  }

  return getProjectNameLovCommonFetch;
});