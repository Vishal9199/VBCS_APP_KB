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

  class openDrawerAction extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Open the drawer
        $variables.drawerOpen = true;
    }
  }

  return openDrawerAction;
});