// ============================================================================
// FILE 2:cancelMilestoneDialogChain.js
// Resets milestoneVar and closes the dialog.
// ============================================================================
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

  class cancelMilestoneDialogChain extends ActionChain {

    async run(context) {
      const { $variables } = context;

      await Actions.resetVariables(context, {
        variables: ['$variables.milestoneVar'],
      });

      $variables.isMilestoneCreate = 'Y';

      const dialog = document.getElementById('milestoneDialog');
      if (dialog) dialog.close();
    }
  }

  return cancelMilestoneDialogChain;
});