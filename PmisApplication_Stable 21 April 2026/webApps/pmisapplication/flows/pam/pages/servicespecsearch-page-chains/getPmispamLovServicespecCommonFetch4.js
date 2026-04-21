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

  class getPmispamLovServicespecCommonFetch4 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      /* =========================================================
       * Default search value (important for initial load)
       * ========================================================= */
      let searchVal2 = configuration;

      /* =========================================================
       * Capture LOV search text (when user types)
       * ========================================================= */
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamLovServicespecCommon',
        requestType: 'json',
        hookHandler: configuration.hookHandler,
        uriParams: {
          searchVal: searchVal2,
        },
        headers: {
          lovFor: 'TENDER_NUMBER',
        },
      });

      /* =========================================================
       * Error handling
       * ========================================================= */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Tender Number LOV Fetch Failed',
          message: response.statusText || 'Unable to fetch Tender Number LOV data',
          type: 'error'
        });
        return;
      }

      return response;
    }
  }

  return getPmispamLovServicespecCommonFetch4;
});