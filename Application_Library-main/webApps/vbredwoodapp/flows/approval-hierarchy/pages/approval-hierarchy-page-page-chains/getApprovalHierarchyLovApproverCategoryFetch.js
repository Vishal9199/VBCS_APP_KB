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

  class getApprovalHierarchyLovApproverCategoryFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestApprovalHierarchyLovApproverCategoryResult = await Actions.callRest(context, {
          endpoint: 'approvalHeirarchy/getApprovalHierarchyLovApproverCategory',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestApprovalHierarchyLovApproverCategoryResult;
      } else {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'approvalHeirarchy/getApprovalHierarchyLovApproverCategory',
          responseType: 'getApprovalHierarchyLovApproverCategoryResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }

  }

  return getApprovalHierarchyLovApproverCategoryFetch;
});
