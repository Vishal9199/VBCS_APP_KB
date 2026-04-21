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

  class cancelEstimateCostDialogChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $variables } = context;

      // Reset form variable
      await Actions.resetVariables(context, {
        variables: [
          '$variables.estimateCostVar',
        ],
      });

      // Close dialog
      const dialogElement = document.getElementById('estimateCostDialog');
      if (dialogElement) {
        dialogElement.close();
      }
    }
  }

  return cancelEstimateCostDialogChain;
});