define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getPmispddProjectlistLovProjectFetch extends ActionChain {

    async run(context, { configuration }) {
      const { $variables } = context;

      let searchVal = configuration;

      // Extract search text from LOV fetch
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const callRestEndpoint1 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddProjectlistLovProject',
        uriParams: {
          searchVal: searchVal
        }
      });

      $variables.displayDtlVar.oraProjectName = callRestEndpoint1.body.items[0].project_name;
      $variables.displayDtlVar.oraProjectNumber = callRestEndpoint1.body.items[0].project_number;
      // $variables.displayDtlVar.tenderName = callRestEndpoint1.body.items[0];
      // $variables.displayDtlVar.tenderNumber = callRestEndpoint1.body.items[0].project_name;

      return callRestEndpoint1;
    }
  }

  return getPmispddProjectlistLovProjectFetch;
});