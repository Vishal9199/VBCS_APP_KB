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

  class getEmailLovFieldNameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {

        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Application/getEmailLovFieldName',
          responseType: 'getEmailLovFieldNameResponse3',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          uriParams: {
            'p_viewname': $variables.emailSectionVar.view_name,
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
        });

        return callRestEndpoint1;

      } else {

        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'Application/getEmailLovFieldName',
          responseType: 'getEmailLovFieldNameResponse3',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
          uriParams: {
            'p_viewname': $variables.emailSectionVar.view_name,
          },
        });

        return callRestEndpoint1;
      }
    }
  }

  return getEmailLovFieldNameFetch;
});