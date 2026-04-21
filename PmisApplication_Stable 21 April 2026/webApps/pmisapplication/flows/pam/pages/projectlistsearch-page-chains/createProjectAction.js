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

  class createProjectAction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application } = context;

      let enc_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: '0',
        },
      });

      try {
        // Navigate to create project page
        const toProjectlistedit = await Actions.navigateToPage(context, {
          page: 'projectlistedit',
          params: {
            pNavCode: 'CREATE',
            pNavId: enc_key,
          },
        });

      } catch (error) {
        console.error("Error in createProjectAction:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Navigation Error',
          message: 'Failed to navigate to create page: ' + error.message,
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return createProjectAction;
});