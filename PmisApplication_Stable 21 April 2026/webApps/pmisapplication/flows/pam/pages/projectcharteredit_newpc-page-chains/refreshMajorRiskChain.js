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

  class refreshMajorRiskChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $variables } = context;

      try {
        // Refresh ADP
        await Actions.fireDataProviderEvent(context, {
          target: $variables.ADPmajorRisk,
          refresh: null,
        });

        await Actions.fireNotificationEvent(context, {
          summary: 'Success',
          message: 'Major risk table refreshed',
          type: 'confirmation',
          displayMode: 'transient',
        });

      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to refresh: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }
  }

  return refreshMajorRiskChain;
});