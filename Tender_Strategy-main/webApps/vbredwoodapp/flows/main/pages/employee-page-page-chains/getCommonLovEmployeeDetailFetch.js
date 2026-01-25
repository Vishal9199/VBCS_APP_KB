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

  class getCommonLovEmployeeDetailFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestCommonLovEmployeeDetailResult = await Actions.callRest(context, {
          endpoint: 'ORDS/getCommonLovEmployeeDetail',
          uriParams: {
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestCommonLovEmployeeDetailResult;
      } else {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'ORDS/getCommonLovEmployeeDetail',
          responseType: 'getCommonLovEmployeeDetailResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }
  }

  return getCommonLovEmployeeDetailFetch;
});
