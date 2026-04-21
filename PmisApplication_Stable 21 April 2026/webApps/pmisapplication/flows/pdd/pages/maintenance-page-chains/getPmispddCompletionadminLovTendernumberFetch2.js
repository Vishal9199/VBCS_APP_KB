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

      let searchVal = configuration;

      // Extract search text from LOV
      if (
        configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text
      ) {
        searchVal = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddCompletionadminLovTendernumber',
        uriParams: {
          searchVal: searchVal,
        },
        responseType: 'getPmispddCompletionadminLovTendernumber',
        responseBodyFormat: 'json',
      });

      return response;
    }
  }

  return getPmispddCompletionadminLovTendernumberFetch;
});