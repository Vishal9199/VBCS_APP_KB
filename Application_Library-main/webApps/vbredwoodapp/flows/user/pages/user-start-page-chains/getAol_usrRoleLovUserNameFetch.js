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

      // ✅ Check if a filter criterion (LOV search input) exists
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'User/getAol_usrRoleLovUserName',
          responseType: 'getAolUsrRoleLovUserNameResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestEndpoint1;

      } else {
        // ✅ Default fetch (no search input)
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'User/getAol_usrRoleLovUserName',
          responseType: 'getAolUsrRoleLovUserNameResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }
  }

  return getAol_usrRoleLovUserNameFetch;
});
