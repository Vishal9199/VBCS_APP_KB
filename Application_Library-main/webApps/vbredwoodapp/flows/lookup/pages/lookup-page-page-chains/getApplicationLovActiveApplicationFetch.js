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

  class getApplicationLovActiveApplicationFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $variables } = context;

      // Base URI params
      const uriParams = {};

      // --- Handle filterCriterion (LOV search typing)
      const filterCriterion = configuration.hookHandler?.context?.fetchOptions?.filterCriterion;
      if (filterCriterion?.text) {
        uriParams['search_var'] = filterCriterion.text;
      }

      // --- REST Call
      return Actions.callRest(context, {
        endpoint: 'Application/getApplicationLovActiveApplication',
        uriParams,
        responseType: 'getApplicationLovActiveApplicationResponse',
        hookHandler: configuration.hookHandler,
        requestType: 'json',
      });
    }

  }

  return getApplicationLovActiveApplicationFetch;
});
