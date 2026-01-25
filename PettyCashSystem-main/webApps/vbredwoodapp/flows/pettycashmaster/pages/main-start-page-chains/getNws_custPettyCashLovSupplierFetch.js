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

  class getNws_custPettyCashLovSupplierFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.configuration
     * @param {string} params.inputTemp
     */
    async run(context, { configuration, inputTemp }) {
      const { $page, $flow, $application, $constants, $variables } = context;

    //   const callRestEndpoint1 = await Actions.callRest(context, {
    //     endpoint: 'ORDS/getNws_custTankerLovWilayatName',
    //     responseType: 'getNws_custTankerLovWilayatName',
    //     hookHandler: configuration.hookHandler,
    //     requestType: 'json',
    //   });

    //   return callRestEndpoint1;
    // }

    if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getNws_custPettyCashLovSupplier',
          uriParams: {
            'p_governate': $variables.SearchObj.p_governorate,
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
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
          endpoint: 'ORDS/getNws_custPettyCashLovSupplier',
          uriParams: {
            'p_governate': $variables.SearchObj.p_governorate,
            searchVal: configuration,
          },
        });
 
        return callRestEndpoint1;
      }
    }
  }

  return getNws_custPettyCashLovSupplierFetch;
});