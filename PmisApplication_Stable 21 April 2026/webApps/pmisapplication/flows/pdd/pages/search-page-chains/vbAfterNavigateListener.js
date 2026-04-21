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

  class vbAfterNavigateListener extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $variables } = context;

      try {
        // Initialize search on page load
        await Actions.callChain(context, {
          chain: 'searchAC',
        });

      } catch (error) {
        console.error("Error in vbAfterNavigateListener:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load page: ' + error.message,
          displayMode: 'persist',
          type: 'error',
        });
      }

      $variables.showNavigationMenu = true;
    }
  }

  return vbAfterNavigateListener;
});