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

  class closeDrawerAction extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Close the drawer
      $variables.drawerOpen = false;
    }
  }

  return closeDrawerAction;
});