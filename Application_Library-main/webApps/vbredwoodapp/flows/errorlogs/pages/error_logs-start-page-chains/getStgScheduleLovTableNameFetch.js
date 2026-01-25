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

  class getStgScheduleLovTableNameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ✅ Check if the LOV search bar has a filterCriterion (user typed something)
      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const callRestSearch = await Actions.callRest(context, {
          endpoint: 'ErrorLog/getStgScheduleLovTableName',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestSearch;
      } 
      else{
      // ✅ No search → default LOV population
      const callRestDefault = await Actions.callRest(context, {
        endpoint: 'ErrorLog/getStgScheduleLovTableName',
        responseType: 'getStgScheduleLovTableNameResponse',
        hookHandler: configuration.hookHandler,
        requestType: 'json',
      });

      return callRestDefault;
    }}
  }

  return getStgScheduleLovTableNameFetch;
});
