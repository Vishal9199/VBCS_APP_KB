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

  class SelectValueItemChangeChain extends ActionChain {

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

      // await Actions.fireNotificationEvent(context, {
      //   summary: 'A ' + key + ' B',
      //   displayMode: 'persist',
      //   type: 'info',
      // });

      // await Actions.fireNotificationEvent(context, {
      //   summary: $variables.tenderStrategyVar.currency,
      //   displayMode: 'persist',
      //   type: 'error',
      // });
    }
  }

  return SelectValueItemChangeChain;
});
