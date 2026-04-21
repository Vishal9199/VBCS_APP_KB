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

  class getPmispamProjectcharterLovProjectnameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      /* 🔍 Case 1: LOV search (when user types in the LOV) */
      if (
        configuration && configuration.hookHandler &&
        configuration.hookHandler.context && configuration.hookHandler.context.fetchOptions &&
        configuration.hookHandler.context.fetchOptions.filterCriterion
      ) {
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamProjectcharterLovProjectname',
          uriParams: {
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text
          }
        });

        if (!response.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: response.status,
            message: response.statusText,
            type: 'error'
          });
        } else {
          return response;
        }
      }

      /* 📦 Case 2: Initial load / no search text */
      const callRestEndpoint = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamProjectcharterLovProjectname',
        uriParams: {
          searchVal: configuration
        }
      });

      return callRestEndpoint;
    }
  }

  return getPmispamProjectcharterLovProjectnameFetch;
});