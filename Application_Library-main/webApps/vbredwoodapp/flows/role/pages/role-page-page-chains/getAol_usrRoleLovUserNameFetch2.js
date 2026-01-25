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

  class getAol_usrRoleLovUserNameFetch2 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ✅ Check for LOV search input (filter criterion)
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'User/getAol_usrRoleLovUserName',
          responseType: 'getAolUsrRoleLovUserNameResponse4',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          headers: {
            'P_ROLE_ID': $variables.roleManagementVar.role_id,
          },
        });

        return callRestEndpoint1;

      } else {
        // ✅ Default call (no search input)
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'User/getAol_usrRoleLovUserName',
          responseType: 'getAolUsrRoleLovUserNameResponse4',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          headers: {
            'P_ROLE_ID': $variables.roleManagementVar.role_id,
          },
        });

        return callRestEndpoint1;
      }
    }
  }

  return getAol_usrRoleLovUserNameFetch2;
});
