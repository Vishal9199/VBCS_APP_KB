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

  class onLineRefresh extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let enc_payload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.searchObj,
        },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'PmisSetup/postPmisCalendarLineSearch',
        body: {"payload": enc_payload},
      });

      if (response.body.count >= 1) {

        $variables.ADPcalendarLines.data = response.body.P_OUTPUT;

        await Actions.fireDataProviderEvent(context, {
          refresh: null,
          target: $variables.ADPcalendarLines,
        });
        $variables.totalRecords = response.body.OUT_COUNT;
      }
    }
  }

  return onLineRefresh;
});
