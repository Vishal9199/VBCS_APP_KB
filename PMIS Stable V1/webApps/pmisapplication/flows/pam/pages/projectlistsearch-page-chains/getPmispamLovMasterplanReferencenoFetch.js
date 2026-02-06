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

  class getPmispamLovMasterplanReferencenoFetch extends ActionChain {

    /**
     * Custom fetch for Master Plan Reference No LOV
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
      let searchVal = '';

      /* =========================================================
       * Capture search text when user types
       * ========================================================= */
      if (
        configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text
      ) {
        searchVal =
          configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamLovMasterplanReferenceno',
        requestType: 'json',
        hookHandler: configuration.hookHandler,
        uriParams: {
          searchVal: searchVal   // 👈 ALWAYS pass string
        }
      });

      /* =========================================================
       * Error handling
       * ========================================================= */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Reference No LOV Fetch Failed',
          message:
            response.statusText ||
            'Unable to fetch Master Plan Reference No LOV',
          type: 'error'
        });
        return;
      }

      return response;
    }
  }

  return getPmispamLovMasterplanReferencenoFetch;
});