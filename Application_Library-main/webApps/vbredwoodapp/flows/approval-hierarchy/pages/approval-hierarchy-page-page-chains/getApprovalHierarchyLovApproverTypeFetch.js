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

  class getApprovalHierarchyLovApproverTypeFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestApprovalHierarchyLovApproverTypeResult = await Actions.callRest(context, {
          endpoint: 'approvalHeirarchy/getApprovalHierarchyLovApproverType',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestApprovalHierarchyLovApproverTypeResult;
      } else {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'approvalHeirarchy/getApprovalHierarchyLovApproverType',
          responseType: 'getApprovalHierarchyLovApproverTypeResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }

  }

  return getApprovalHierarchyLovApproverTypeFetch;
});
