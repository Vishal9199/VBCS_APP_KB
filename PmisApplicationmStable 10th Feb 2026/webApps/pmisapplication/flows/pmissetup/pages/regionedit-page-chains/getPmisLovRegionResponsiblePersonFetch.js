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

  class getPmisLovRegionResponsiblePersonFetch extends ActionChain {

    /**
     * Custom fetch for Region Responsible Person LOV
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
        endpoint: 'PmisSetup/getPmisLovRegionResponsiblePerson',
        uriParams: {
          searchVal: searchVal2   // 👈 always send string
        }
      });

      /* =========================================================
       * Error handling
       * ========================================================= */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Responsible Person LOV Fetch Failed',
          message: response.statusText || 'Unable to fetch Region Responsible Person LOV',
          type: 'error'
        });
        return;
      }

      return response;
    }
  }

  return getPmisLovRegionResponsiblePersonFetch;
});