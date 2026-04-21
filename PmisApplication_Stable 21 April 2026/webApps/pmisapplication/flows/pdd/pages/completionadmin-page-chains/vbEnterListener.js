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

  class vbEnterListener extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $variables } = context;

      try {
        // Initialize search on page load
        await Actions.callChain(context, {
          chain: 'searchCompletionAction',
        });

      } catch (error) {
        console.error("Error in vbEnterListener:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load page: ' + error.message,
          displayMode: 'persist',
          type: 'error',
        });
      }
    }
  }

  return vbEnterListener;
});