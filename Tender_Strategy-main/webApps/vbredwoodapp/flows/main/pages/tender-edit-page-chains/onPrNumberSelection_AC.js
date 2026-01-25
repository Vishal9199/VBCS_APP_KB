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

  class onPrNumberSelection_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     * @param {any} params.key
     * @param {any} params.data
     * @param {any} params.metadata
     * @param {any} params.valueItem
     */
    async run(context, { event, previousValue, value, updatedFrom, key, data, metadata, valueItem }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (value !== null) {
        $variables.postPayloadTypeVar.pr_title = data.title;
        $variables.postPayloadTypeVar.pr_estimated_value = data.amount;
        $variables.postPayloadTypeVar.currency = data.currency_code;

        let encryptedId = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: data.requisition_header_id,
          },
        });


        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getTenderStrategyTenderRfqDetail',
          headers: {
            'x-pr-session-id': encryptedId,
          },
        });

        $variables.tenderRfqDetailVar = response?.body?.items[0];
      }
    }
  }

  return onPrNumberSelection_AC;
});
