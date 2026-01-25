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

  class getAol_usrRoleLovUserNameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestAolUsrRoleLovUserNameResult = await Actions.callRest(context, {
          endpoint: 'User/getAol_usrRoleLovUserName',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          headers: {
            'P_ROLE_ID': $variables.approvalRoleVar.approval_role_id,
          },
        });

        return callRestAolUsrRoleLovUserNameResult;
      } else {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'User/getAol_usrRoleLovUserName',
          responseType: 'getAolUsrRoleLovUserNameResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          headers: {
            'P_ROLE_ID': $variables.approvalRoleVar.approval_role_id,
          },
        });

        return callRestEndpoint1;
      }
    }

  }

  return getAol_usrRoleLovUserNameFetch;
});
