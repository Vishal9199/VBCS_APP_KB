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

  class getTenderStrategyLovContractHolderFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // const callRestEndpoint1 = await Actions.callRest(context, {
      //   endpoint: 'ORDS/getTenderStrategyLovContractHolder',
      //   responseType: 'getTenderStrategyLovContractHolder',
      //   hookHandler: configuration.hookHandler,
      //   requestType: 'json',
      // });

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getTenderStrategyLovContractHolder',
          uriParams: {
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          }
        });
 
        if (!response.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: response.status,
          });
        } else {
          return response;
        }
      } else {
 
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'ORDS/getTenderStrategyLovContractHolder',
          uriParams: {
            searchVal: configuration,
          }
        });

        return callRestEndpoint1;
      }
    }
  }

  return getTenderStrategyLovContractHolderFetch;
});
