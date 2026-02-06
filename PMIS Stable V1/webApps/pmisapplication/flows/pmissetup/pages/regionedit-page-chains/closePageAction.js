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

  class closePageAction extends ActionChain {

    /**
     * Close page and navigate back
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {

        await Actions.navigateBack(context, {
        });

      } catch (error) {
        console.error('closePageAction error:', error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to navigate: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return closePageAction;
});