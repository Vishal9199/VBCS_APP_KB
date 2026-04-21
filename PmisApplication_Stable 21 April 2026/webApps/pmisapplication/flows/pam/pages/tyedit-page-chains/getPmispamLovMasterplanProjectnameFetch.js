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

  class getPmispamLovMasterplanProjectnameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamLovMasterplanProjectname',
          uriParams: {
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return response;
      } else {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamLovMasterplanProjectname',
          responseType: 'getPmispamLovMasterplanProjectnameResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }
  }

  return getPmispamLovMasterplanProjectnameFetch;
});