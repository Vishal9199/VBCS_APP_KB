define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getPmispddCompletionadminLovTendernumberFetch3 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $variables } = context;

      let searchVal = configuration;

      // Extract search text from LOV
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const callRestEndpoint1 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddCompletionadminLovTendernumber',
        uriParams: {
          searchVal: searchVal
        }
      });

      return callRestEndpoint1;
    }
  }

  return getPmispddCompletionadminLovTendernumberFetch3;
});