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

  class openDependencyDialogChain extends ActionChain {

    async run(context) {
      const { $variables, $application } = context;

      await Actions.resetVariables(context, {
        variables: ['$variables.dependencyVar'],
      });

      $variables.dependencyVar.project_charter_id =
        $variables.projectCharterVar.project_charter_id;
      $variables.dependencyVar.created_by        = $application.user.email || 'CURRENT_USER';
      $variables.dependencyVar.last_updated_by   = $application.user.email || 'CURRENT_USER';
      $variables.dependencyVar.last_updated_login = $application.user.email || 'CURRENT_USER';

      $variables.isDependencyCreate = 'Y';

      console.log('📂 openDependencyDialogChain: CREATE mode');

      const dialog = document.getElementById('dependencyDialog');
      if (dialog) dialog.open();
    }
  }

  return openDependencyDialogChain;
});