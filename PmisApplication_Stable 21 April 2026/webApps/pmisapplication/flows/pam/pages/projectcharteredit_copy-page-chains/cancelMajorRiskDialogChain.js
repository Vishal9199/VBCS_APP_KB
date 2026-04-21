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

  class cancelMajorRiskDialogChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $variables } = context;

      // Reset form variable
      await Actions.resetVariables(context, {
        variables: [
          '$variables.majorRiskVar',
        ],
      });

      // Close dialog
      const dialogElement = document.getElementById('majorRiskDialog');
      if (dialogElement) {
        dialogElement.close();
      }
    }
  }

  return cancelMajorRiskDialogChain;
});