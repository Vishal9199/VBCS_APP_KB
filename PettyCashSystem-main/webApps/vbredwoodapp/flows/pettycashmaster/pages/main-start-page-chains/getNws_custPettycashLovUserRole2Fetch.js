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

  class getNws_custPettycashLovUserRole2Fetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

    //   const callRestEndpoint1 = await Actions.callRest(context, {
    //     endpoint: 'ORDS/getNws_custPettycashLovUserRole2',
    //     uriParams: {
    //       'p_email_address': $application.variables.enc_UserLogin,
    //     },
    //     responseType: 'getNwsCustPettycashLovUserRole2Response',
    //     hookHandler: configuration.hookHandler,
    //     requestType: 'json',
    //   });

    //   return callRestEndpoint1;
    // }
    if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getNws_custPettycashLovUserRole2',
          uriParams: {
            // searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
            'p_email_address': $application.variables.enc_UserLogin,
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
          endpoint: 'ORDS/getNws_custPettycashLovUserRole2',
          uriParams: {
            // searchVal: configuration,
            'p_email_address': $application.variables.enc_UserLogin,
          },
        });

        return callRestEndpoint1;
      }
    }
  }

  return getNws_custPettycashLovUserRole2Fetch;
});
