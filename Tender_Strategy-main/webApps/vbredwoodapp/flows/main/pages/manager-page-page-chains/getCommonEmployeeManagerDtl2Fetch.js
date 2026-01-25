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

  class getCommonEmployeeManagerDtlFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let encryptedUserEmail = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $application.constants.appType === 'LOCAL_DEV' ? $application.constants.developerUser : $application.user.email,
        },
      });

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestCommonEmployeeManagerDtlResult = await Actions.callRest(context, {
          endpoint: 'ORDS/getCommonEmployeeManagerDtl',
          uriParams: {
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          headers: {
            'x-session-user': encryptedUserEmail,
          },
        });

        return callRestCommonEmployeeManagerDtlResult;
      } else {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'ORDS/getCommonEmployeeManagerDtl',
          responseType: 'getCommonEmployeeManagerDtlResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          headers: {
            'x-session-user': encryptedUserEmail,
          },
        });

        return callRestEndpoint1;
      }
    }
  }

  return getCommonEmployeeManagerDtlFetch;
});
