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

  class getApproverRoleLovUserNameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestApproverRoleLovUserNameResult = await Actions.callRest(context, {
          endpoint: 'ApprovalUserRole/getApproverRoleLovUserName',
          uriParams: {
            'P_APPROVAL_ROLE_ID': $variables.approvalRoleVar.approval_role_id,
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestApproverRoleLovUserNameResult;
      } else {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'ApprovalUserRole/getApproverRoleLovUserName',
          uriParams: {
            'P_APPROVAL_ROLE_ID': $variables.approvalRoleVar.approval_role_id,
          },
          responseType: 'getApproverRoleLovUserNameResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }

  }

  return getApproverRoleLovUserNameFetch;
});
