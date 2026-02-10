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

  class refreshSearchAction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $variables } = context;

      try {
        // Re-run search with current parameters
        await Actions.callChain(context, {
          chain: 'searchAC',
        });

      } catch (error) {
        console.error("Error in refreshSearchAction:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to refresh: ' + error.message,
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return refreshSearchAction;
});