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

  class getPmispamLovMasterplanDepCalendarnameFetch extends ActionChain {

    /**
     * Custom fetch for Masterplan Dependent Calendar Name LOV
     *
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      /* =========================================================
       * Default value for initial LOV load
       * ========================================================= */
      let searchVal2 = configuration;

      /* =========================================================
       * Capture LOV search text when user types
       * ========================================================= */
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamLovMasterplanDepCalendarname',
        uriParams: {
          searchVal: searchVal2   // 👈 never NULL
        }
      });

      // $variables.lineTableName = response.body.items[0].calendar_name;

      /* =========================================================
       * Error handling
       * ========================================================= */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Calendar Name LOV Fetch Failed',
          message: response.statusText || 'Unable to fetch Masterplan Calendar Name LOV',
          type: 'error'
        });
        return;
      }

      return response;
    }
  }

  return getPmispamLovMasterplanDepCalendarnameFetch;
});