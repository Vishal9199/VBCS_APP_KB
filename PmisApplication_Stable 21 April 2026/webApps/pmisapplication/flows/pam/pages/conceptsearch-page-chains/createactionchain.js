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

  class createactionchain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let enc_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: '0',
        },
      });

      try {
        const toConceptedit = await Actions.navigateToPage(context, {
          page: 'conceptedit',
          params: {
            enterType: '0',
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
  return createactionchain;
});
