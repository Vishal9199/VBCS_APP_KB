define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onEditIssue extends ActionChain {

    async run(context, { key }) {
      const { $variables } = context;

      // Setting lvRowToEdit triggers oj-table edit-row binding to enter
      // edit mode for the specified row, which fires oj-before-row-edit.
      $variables.lvRowToEdit = { rowKey: key };
    }
  }

  return onEditIssue;
});