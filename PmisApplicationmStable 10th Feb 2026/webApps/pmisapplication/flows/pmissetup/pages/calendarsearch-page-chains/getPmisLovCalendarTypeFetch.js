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

  class getPmisLovCalendarTypeFetch extends ActionChain {

    /**
     * Custom fetch for Calendar Type LOV
     *
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      /* =========================================================
       * Default search value for initial LOV load
       * ========================================================= */
      let searchVal2 = configuration;

      /* =========================================================
       * Capture search text when user types in LOV
       * ========================================================= */
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'ORDS/getPmisLovCalendarType',
        uriParams: {
          searchVal: searchVal2   // 👈 always send string
        }
      });

      /* =========================================================
       * Error handling
       * ========================================================= */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Calendar Type LOV Fetch Failed',
          message: response.statusText || 'Unable to fetch Calendar Type LOV',
          type: 'error'
        });
        return;
      }

      return response;
    }
  }

  return getPmisLovCalendarTypeFetch;
});