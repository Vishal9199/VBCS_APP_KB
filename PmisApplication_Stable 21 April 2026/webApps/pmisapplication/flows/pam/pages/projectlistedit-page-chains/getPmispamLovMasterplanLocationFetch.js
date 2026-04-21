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

  class getPmispamLovMasterplanLocationFetch extends ActionChain {

    /**
     * Custom fetch for Masterplan Location LOV
     * Dependent on selected Region (regionCode)
     *
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      /* =========================================================
       * Default search value (initial LOV load)
       * ========================================================= */
      let searchVal2 = configuration;

      /* =========================================================
       * Capture LOV search text when user types
       * ========================================================= */
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      console.log("+++++++++++123: ", $variables.valueFromLov.regionCode);
      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamLovMasterplanLocation',
        uriParams: {
          p_dependent_lookup_value_code: $variables.valueFromLov.regionCode, // 🔗 parent
          searchVal: searchVal2                                              // 🔍 filter
        }
      });

      /* =========================================================
       * Error handling
       * ========================================================= */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Location LOV Fetch Failed',
          message: response.statusText || 'Unable to fetch Masterplan Location LOV',
          type: 'error'
        });
        return;
      }

      return response;
    }
  }

  return getPmispamLovMasterplanLocationFetch;
});