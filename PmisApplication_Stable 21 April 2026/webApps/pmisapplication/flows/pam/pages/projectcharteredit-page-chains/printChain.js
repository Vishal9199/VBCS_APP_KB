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

  class printChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      try {
        // Trigger browser print dialog
        window.print();

      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to print: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }
  }

  return printChain;
});