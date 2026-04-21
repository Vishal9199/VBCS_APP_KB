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

  class logBufferContent extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Get all submittable items
      const submittableItems = $page.variables.bufferDPSchedule.instance.getSubmittableItems();

      console.log("=== Buffer Content Log ===");
      console.log("Total Submittable Items:", submittableItems.length);
      
      if (submittableItems.length > 0) {
        submittableItems.forEach((item, index) => {
          console.log(`Item ${index + 1}:`);
          console.log("  Operation:", item.operation);
          console.log("  Key:", item.item.metadata.key);
          console.log("  Data:", JSON.stringify(item.item.data, null, 2));
          if (item.item.metadata.message) {
            console.log("  Message:", item.item.metadata.message);
          }
        });
      } else {
        console.log("No submittable items in buffer");
      }
      
      console.log("=== End Buffer Content Log ===");

      await Actions.fireNotificationEvent(context, {
        summary: 'Buffer Content Logged',
        message: `Check console for ${submittableItems.length} buffered item(s)`,
        type: 'info',
        displayMode: 'transient'
      });
    }
  }

  return logBufferContent;
});