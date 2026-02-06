define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ActionUtils
) => {
  'use strict';

  class getRegionLovFetch extends ActionChain {

    /**
     * Region LOV fetch
     * - Shows values initially
     * - Filters when user types
     * - Does NOT affect other usages
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Default: no restriction
      let searchVal2 = configuration;

      // Capture LOV search text (when user types)
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PmisSetup/getPmisLovRegionName',
        uriParams: {
          searchVal: searchVal2   // optional & safe
        }
      });

      return response;
    }
  }

  return getRegionLovFetch;
});