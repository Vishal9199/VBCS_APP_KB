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

  class getPmispamConceptstudyLovProjectnameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamConceptstudyLovProjectname',
          uriParams: {
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
            currentProjectId: $variables.pamScheduleDetailVar.project_id,
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
           endpoint: 'PAM/getPmispamConceptstudyLovProjectname',
           responseType: 'getPmispamConceptstudyLovProjectnameResponse',
           hookHandler: configuration.hookHandler,
           requestType: 'json',
           uriParams: {
             searchVal: configuration,
             currentProjectId: $variables.pamScheduleDetailVar.project_id,
           },
         });
                 return callRestEndpoint1;
      }



    }
  }

  return getPmispamConceptstudyLovProjectnameFetch;
});
