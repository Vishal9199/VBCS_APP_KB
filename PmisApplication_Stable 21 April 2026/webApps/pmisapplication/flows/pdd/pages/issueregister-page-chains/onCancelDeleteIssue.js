define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onCancelDeleteIssue extends ActionChain {

    async run(context) {
      const { $variables } = context;

      document.getElementById('issueConfirmDialog').close();

      // Clear delete state variables
      $variables.lvDeleteKey = 0;
      $variables.lvDeleteRowData = {};

      console.log('onCancelDeleteIssue: delete cancelled');
    }
  }

  return onCancelDeleteIssue;
});