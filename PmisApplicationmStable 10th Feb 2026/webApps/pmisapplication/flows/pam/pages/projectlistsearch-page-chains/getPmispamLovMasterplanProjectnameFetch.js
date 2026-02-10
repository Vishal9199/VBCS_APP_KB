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

  class getPmispamLovMasterplanProjectnameFetch extends ActionChain {

    /**
     * Custom fetch for Master Plan Project Name LOV
     *
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      /* =========================================================
       * Always send a default value (initial load)
       * ========================================================= */
      let searchVal2 = configuration;

      /* =========================================================
       * Capture search text when user types in LOV
       * ========================================================= */
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamLovMasterplanProjectname',
        uriParams: {
          searchVal: searchVal2,
          'p_mp_ref_id': $variables.searchObj.p_mp_ref_num,
        },
      });

      /* =========================================================
       * Error handling
       * ========================================================= */
      if (!response.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Project Name LOV Fetch Failed',
          message:
            response.statusText ||
            'Unable to fetch Master Plan Project Name LOV',
          type: 'error'
        });
        return;
      }

      return response;
    }
  }

  return getPmispamLovMasterplanProjectnameFetch;
});