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

  class cancelDependencyDialogChain extends ActionChain {

    async run(context) {
      const { $variables } = context;

      await Actions.resetVariables(context, {
        variables: ['$variables.dependencyVar'],
      });

      $variables.isDependencyCreate = 'Y';

      const dialog = document.getElementById('dependencyDialog');
      if (dialog) dialog.close();
    }
  }

  return cancelDependencyDialogChain;
});