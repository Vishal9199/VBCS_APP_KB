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

  class getCommonLovLookupFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      /* =========================================================
       * Default search value (initial load)
       * ========================================================= */
      let searchVal = configuration;

      /* =========================================================
       * LOV search while typing
       * ========================================================= */
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getCommonLovLookup',
        uriParams: {
          searchVal: searchVal   // 👈 use correct filter param
        },
        headers: {
          p_lookup_type_code: 'STATUS'
        }
      });

      /* =========================================================
       * Error handling
       * ========================================================= */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Lookup LOV Fetch Failed',
          message: response.statusText || 'Unable to fetch lookup values',
          type: 'error'
        });
        return;
      }

      return response;
    }
  }

  return getCommonLovLookupFetch;
});