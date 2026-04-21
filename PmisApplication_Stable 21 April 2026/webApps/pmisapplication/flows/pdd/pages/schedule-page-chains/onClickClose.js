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

  class onClickClose extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Check for unsaved changes
      const submittableItems = $page.variables.bufferDPSchedule.instance.getSubmittableItems();

      if (submittableItems.length > 0) {
        // Show confirmation dialog for unsaved changes
        const confirmed = confirm("You have unsaved changes. Are you sure you want to close without saving?");
        
        if (!confirmed) {
          console.log("onClickClose - User cancelled close");
          return;
        }
      }

      console.log("onClickClose - Closing page");

      // Navigate back or close
      // Uncomment and modify based on your navigation structure:
      // await Actions.navigateBack(context);
      // OR
      // await Actions.navigateToFlow(context, {
      //   page: 'schedule-list-page'
      // });

      await Actions.fireNotificationEvent(context, {
        summary: 'Page Closed',
        message: 'Returning to previous page',
        type: 'info',
        displayMode: 'transient'
      });
    }
  }

  return onClickClose;
});