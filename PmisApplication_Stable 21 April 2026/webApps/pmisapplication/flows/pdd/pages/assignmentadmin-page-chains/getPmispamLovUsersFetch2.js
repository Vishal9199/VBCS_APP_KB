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

  class getPmispamLovUsersFetch2 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {

      let searchVal = configuration;

      // Extract search text from LOV fetch
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const callRestEndpoint1 = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamLovUsers',
        uriParams: {
          searchVal: searchVal
        }
      });

      return callRestEndpoint1;
    }
  }

  return getPmispamLovUsersFetch2;
});