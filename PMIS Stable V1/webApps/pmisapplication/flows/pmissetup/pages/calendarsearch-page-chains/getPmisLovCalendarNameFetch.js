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

  class getPmisLovCalendarNameFetch extends ActionChain {

    /**
     * Custom fetch for Calendar Name LOV (dependent on Calendar Type)
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

      const response = await Actions.callRest(context, {
        endpoint: 'ORDS/getPmisLovCalendarName',
        uriParams: {
          p_calendar_type_id: $variables.searchObj.p_calendar_type, // 🔗 parent
          searchVal: searchVal2                                     // 🔍 filter
        }
      });

      /* =========================================================
       * Error handling
       * ========================================================= */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Calendar Name LOV Fetch Failed',
          message: response.statusText || 'Unable to fetch Calendar Name LOV',
          type: 'error'
        });
        return;
      }

      return response;
    }
  }

  return getPmisLovCalendarNameFetch;
});