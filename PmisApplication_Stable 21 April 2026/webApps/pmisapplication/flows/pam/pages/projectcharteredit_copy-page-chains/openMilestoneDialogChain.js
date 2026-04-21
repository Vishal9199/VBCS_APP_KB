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

  class openMilestoneDialogChain extends ActionChain {

    async run(context) {
      const { $variables } = context;

      // Reset form to defaults
      await Actions.resetVariables(context, {
        variables: ['$variables.milestoneVar'],
      });

      // Assign a local temporary ID
      $variables.milestoneVar.milestone_id = 0;
      $variables.isMilestoneCreate = 'Y';

      console.log('📅 openMilestoneDialogChain: CREATE mode');

      const dialog = document.getElementById('milestoneDialog');
      if (dialog) dialog.open();
    }
  }

  return openMilestoneDialogChain;
});