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

  class getPmispamLovServicespecCommonFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      /* 🔍 Case 1: Fetch triggered by LOV search (typing) */
      if (
        configuration &&
        configuration.hookHandler &&
        configuration.hookHandler.context &&
        configuration.hookHandler.context.fetchOptions &&
        configuration.hookHandler.context.fetchOptions.filterCriterion
      ) {
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamLovServicespecCommon',
          uriParams: {
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          headers: {
            lovFor: 'BUDGET',
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
        endpoint: 'PAM/getPmispamLovServicespecCommon',
        uriParams: {
          searchVal: configuration
        },
        headers: {
          lovFor: 'BUDGET',
        }
      });

      return callRestEndpoint;
    }
  }

  return getPmispamLovServicespecCommonFetch;
});