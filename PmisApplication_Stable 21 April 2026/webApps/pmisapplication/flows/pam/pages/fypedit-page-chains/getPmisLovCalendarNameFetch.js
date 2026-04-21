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

  class getPmisLovCalendarNameFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {

        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'PmisSetup/getPmisLovCalendarName',
          uriParams: {
            'P_CALENDAR_TYPE_CODE': 'MASTER_PLAN',
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          responseType: 'getPmisLovCalendarNameResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      } else {
         const response = await Actions.callRest(context, {
           endpoint: 'PmisSetup/getPmisLovCalendarName',
           uriParams: {
             'P_CALENDAR_TYPE_CODE': 'MASTER_PLAN',
           },
           responseType: 'getPmisLovCalendarNameResponse',
           hookHandler: configuration.hookHandler,
           requestType: 'json',
         });

        return response;
      }

    }
  }

  return getPmisLovCalendarNameFetch;
});
