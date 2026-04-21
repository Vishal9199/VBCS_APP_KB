define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getPmispddCompletionadminLovTendernumberFetch extends ActionChain {

    async run(context, { configuration }) {

      let searchVal2 = configuration;

      // Extract search text from LOV
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
          searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
        }

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddCompletionadminLovTendernumber',
        uriParams: {
          searchVal: searchVal2
        }
      });

      return response;
    }
  }

  return getPmispddCompletionadminLovTendernumberFetch;
});