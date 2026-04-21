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

  class getPmisLovCalendarNameFetch2 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {

        const response = await Actions.callRest(context, {
          endpoint: 'PmisSetup/getPmisLovCalendarName',
          uriParams: {
            'P_CALENDAR_TYPE_CODE': 'THREE_YEAR_PLAN',
            searchVal: configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          responseType: 'getPmisLovCalendarNameResponse2',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return response;
      } else {
        const callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'PmisSetup/getPmisLovCalendarName',
          uriParams: {
            'P_CALENDAR_TYPE_CODE': 'THREE_YEAR_PLAN',
          },
          responseType: 'getPmisLovCalendarNameResponse2',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });

        return callRestEndpoint1;
      }
    }
  }

  return getPmisLovCalendarNameFetch2;
});