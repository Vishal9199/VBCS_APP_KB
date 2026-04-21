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

  class onClickSaveClose extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Call save action chain
        await Actions.callChain(context, {
          chain: 'onClickSave',
        });

        // Check if there are any errors (if save was successful, submittable items should be 0)
        const remainingItems = $page.variables.bufferDPSchedule.instance.getSubmittableItems();

        if (remainingItems.length === 0) {
          // No errors, navigate back or close
          console.log("onClickSaveClose - Save successful, closing page");

          // Navigate back to previous page or list page
          // Uncomment and modify based on your navigation structure:
          // await Actions.navigateBack(context);
          // OR
          // await Actions.navigateToFlow(context, {
          //   page: 'schedule-list-page'
          // });

          await Actions.fireNotificationEvent(context, {
            summary: 'Success',
            message: 'Changes saved successfully. Page will close.',
            type: 'confirmation',
            displayMode: 'transient'
          });

        } else {
          // There were errors, don't close
          console.log("onClickSaveClose - Save had errors, not closing page");
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Save Incomplete',
            message: 'Some records failed to save. Please review and try again.',
            type: 'warning',
            displayMode: 'persist'
          });
        }

      } catch (error) {
        console.error("onClickSaveClose - Error:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to save and close: ' + error.message,
          type: 'error',
          displayMode: 'persist'
        });
      }
    }
  }

  return onClickSaveClose;
});