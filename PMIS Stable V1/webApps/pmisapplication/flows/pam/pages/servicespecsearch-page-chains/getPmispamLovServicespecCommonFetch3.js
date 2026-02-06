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

  class getPmispamLovServicespecCommonFetch3 extends ActionChain {

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
      let searchVal = configuration;

      /* =========================================================
       * Capture LOV search text (when user types)
       * ========================================================= */
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamLovServicespecCommon',
        requestType: 'json',
        hookHandler: configuration.hookHandler,
        uriParams: {
          searchVal: searchVal
        },
        headers: {
          lovFor: 'TENDER'
        }
      });

      /* =========================================================
       * Error handling
       * ========================================================= */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Tender LOV Fetch Failed',
          message: response.statusText || 'Unable to fetch Tender LOV data',
          type: 'error'
        });
        return;
      }

      return response;
    }
  }

  return getPmispamLovServicespecCommonFetch3;
});