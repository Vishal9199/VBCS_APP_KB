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

  class getAol_usrRoleLovBuNameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestRoleGetAolUsrRoleLovBuNameResult = await Actions.callRest(context, {
          endpoint: 'Role/getAol_usrRoleLovBuName',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestRoleGetAolUsrRoleLovBuNameResult;
      } else {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Role/getAol_usrRoleLovBuName',
          responseType: 'getAolUsrRoleLovBuNameResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }

  }

  return getAol_usrRoleLovBuNameFetch;
});
