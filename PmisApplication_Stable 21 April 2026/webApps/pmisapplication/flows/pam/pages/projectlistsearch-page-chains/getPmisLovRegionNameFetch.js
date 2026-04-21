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

  class getPmisLovRegionNameFetch extends ActionChain {

    /**
     * Custom fetch for Region Name LOV
     *
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      /* =========================================================
       * Default value for initial load
       * ========================================================= */
      let searchVal2 = configuration;

      /* =========================================================
       * Capture LOV search text
       * ========================================================= */
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PmisSetup/getPmisLovRegionName',
        uriParams: {
          searchVal: searchVal2   // 👈 never NULL
        }
      });

      /* =========================================================
       * Error handling
       * ========================================================= */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Region LOV Fetch Failed',
          message: response.statusText || 'Unable to fetch Region Name LOV',
          type: 'error'
        });
        return;
      }
      // $variables.dependentLocation = response.body.dependent_lookup_value_code || "";

      return response;
    }
  }

  return getPmisLovRegionNameFetch;
});