define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getPmispamLovProjectCategoryFetch extends ActionChain {

    async run(context, { configuration }) {

      let searchVal2 = configuration;

      // Extract search text from LOV fetch
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const callRestEndpoint1 = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamLovProjectCategory',
        uriParams: {
          searchVal: searchVal2
        }
      });

      return callRestEndpoint1;
    }
  }

  return getPmispamLovProjectCategoryFetch;
});
