define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getPmispamFiveyearplandtlLovProjectnameFetch extends ActionChain {

    async run(context, { configuration }) {
      const { $variables } = context;

      let searchVal = configuration;

      // Extract search text from LOV fetch
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const callRestEndpoint1 = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamFiveyearplandtlLovProjectname',
        uriParams: {
          searchVal: searchVal
        }
      });

      return callRestEndpoint1;
    }
  }

  return getPmispamFiveyearplandtlLovProjectnameFetch;
});