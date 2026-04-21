define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getPmispamProjectcharterLovParentprojectcharterFetch extends ActionChain {

    async run(context, { configuration }) {
      const { $variables } = context;

      let searchVal2 = configuration;

      // Extract search text from LOV
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamProjectcharterLovParentprojectcharter',
        uriParams: {
          searchVal: searchVal2,
          'p_project_charter_id': $variables.projectCharterVar.project_charter_id,
        },
      });

      return response;
    }
  }

  return getPmispamProjectcharterLovParentprojectcharterFetch;
});