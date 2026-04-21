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

  class getPmispamLovServicespecCommonFetch2 extends ActionChain {

    /**
     * Custom fetch action chain for Service Spec LOV
     *
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let searchVal = configuration;

      /* =========================================================
       * Case 1: LOV search while typing
       * ========================================================= */
      if (
        configuration && configuration.hookHandler && configuration.hookHandler.context && configuration.hookHandler.context.fetchOptions &&
        configuration.hookHandler.context.fetchOptions.filterCriterion && configuration.hookHandler.context.fetchOptions.filterCriterion.text
      ) {
        searchVal =
          configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      /* =========================================================
       * Case 2: Initial load (no search text)
       * ========================================================= */
      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamLovServicespecCommon',
        requestType: 'json',
        uriParams: {
          searchVal: searchVal
        },
        headers: {
          lovFor: 'SERVICE_SPEC'
        }
      });

      /* =========================================================
       * Error handling
       * ========================================================= */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Service Spec LOV Fetch Failed',
          message: response.statusText || 'Unable to fetch Service Spec LOV data',
          type: 'error'
        });
        return;
      }

      return response;
    }
  }

  return getPmispamLovServicespecCommonFetch2;
});