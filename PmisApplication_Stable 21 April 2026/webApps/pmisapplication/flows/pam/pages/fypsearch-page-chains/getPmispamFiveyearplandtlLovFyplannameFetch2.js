define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getPmispamFiveyearplandtlLovFyplannameFetch2 extends ActionChain {

    async run(context, { configuration }) {

      const { $variables } = context;

      let searchVal2 = configuration;

      // Extract search text from LOV
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamFiveyearplandtlLovFyplanname',
        uriParams: {
          p_calendar_type_code: $variables.planType,
          searchVal: searchVal2
        }
      });

      return response;
    }
  }

  return getPmispamFiveyearplandtlLovFyplannameFetch2;
});