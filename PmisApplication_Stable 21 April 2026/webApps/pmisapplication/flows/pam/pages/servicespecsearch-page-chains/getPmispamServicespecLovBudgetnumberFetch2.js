define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getPmispamServicespecLovBudgetnumberFetch2 extends ActionChain {

    async run(context, { configuration }) {

      let searchVal2 = configuration;

      // Read LOV search text safely
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamServicespecLovBudgetnumber',
        uriParams: {
          searchVal: searchVal2
        }
      });

      return response;
    }
  }

  return getPmispamServicespecLovBudgetnumberFetch2;
});