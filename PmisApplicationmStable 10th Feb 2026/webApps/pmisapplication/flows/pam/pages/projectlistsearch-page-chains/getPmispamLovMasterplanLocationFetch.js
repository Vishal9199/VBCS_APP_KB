define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getPmispamLovMasterplanLocationFetch extends ActionChain {

    async run(context, { configuration }) {

      const { $variables } = context;

      let searchVal2 = configuration;

      // 1️⃣ Extract LOV search text
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamLovMasterplanLocation',
        uriParams: {
          searchVal: searchVal2,
          'p_dependent_lookup_value_code': $variables.searchObj.p_region_code,
        },
      });

      return response;
    }
  }

  return getPmispamLovMasterplanLocationFetch;
});