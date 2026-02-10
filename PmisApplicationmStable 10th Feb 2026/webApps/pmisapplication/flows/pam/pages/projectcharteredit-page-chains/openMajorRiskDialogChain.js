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

  class openMajorRiskDialogChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $variables } = context;

      // Reset the form variable for new entry
      await Actions.resetVariables(context, {
        variables: [
          '$variables.majorRiskVar',
        ],
      });

      $variables.isRiskCreate = 'Y';

      // Set mode to 'add'
      $variables.majorRiskMode = 'add';

      // Open the dialog
      const dialogElement = document.getElementById('majorRiskDialog');
      if (dialogElement) {
        dialogElement.open();
      }
    }
  }

  return openMajorRiskDialogChain;
});