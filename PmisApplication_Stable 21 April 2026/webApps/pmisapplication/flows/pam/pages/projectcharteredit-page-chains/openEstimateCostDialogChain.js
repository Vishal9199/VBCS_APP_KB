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

  class openEstimateCostDialogChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables } = context;

      // Reset the form variable for new entry
      await Actions.resetVariables(context, {
        variables: [
          '$variables.estimateCostVar',
        ],
      });

      $variables.isEstCreate = 'Y';

      // Set mode to 'add'
      $variables.estimateCostMode = 'add';

      // Open the dialog
      const dialogElement = document.getElementById('estimateCostDialog');
      if (dialogElement) {
        dialogElement.open();
      }
    }
  }

  return openEstimateCostDialogChain;
});