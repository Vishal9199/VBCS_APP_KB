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

  class getRefNumberLovFetch extends ActionChain {

    /**
     * Reusable Ref Number LOV fetch
     * Adds optional search WITHOUT impacting existing usages
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      /* =====================================================
       * Default search value (no restriction)
       * ===================================================== */
      let searchVal2 = configuration;

      /* =====================================================
       * Capture search text when used in LOV
       * ===================================================== */
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getRefNumberLov',
        uriParams: {
          searchVal: searchVal2
        }
      });

      return response;
    }
  }

  return getRefNumberLovFetch;
});