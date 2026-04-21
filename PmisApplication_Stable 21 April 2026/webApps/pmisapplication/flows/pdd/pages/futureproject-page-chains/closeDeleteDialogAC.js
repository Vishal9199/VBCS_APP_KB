define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class closeDeleteDialogAC extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      document.getElementById('deleteDialog').close();
    }
  }

  return closeDeleteDialogAC;
});