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

  class getAol_usrRoleLovRolenameFetch3 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ✅ If the LOV search includes a filterCriterion, pass it to the REST endpoint
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Role/getAol_usrRoleLovRolename',
          responseType: 'getAolUsrRoleLovRolenameResponse2',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          headers: {
            'p_user_id': $variables.userAccessDetailHeaderVar.user_id,
          },
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestEndpoint1;
      } 
      else {
        // ✅ Default fetch call without search filter
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Role/getAol_usrRoleLovRolename',
          responseType: 'getAolUsrRoleLovRolenameResponse2',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          headers: {
            'p_user_id': $variables.userAccessDetailHeaderVar.user_id,
          },
        });

        return callRestEndpoint1;
      }
    }
  }

  return getAol_usrRoleLovRolenameFetch3;
});
