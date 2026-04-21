define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onEditRisk extends ActionChain {

    async run(context, { key }) {
      const { $variables } = context;

      $variables.lvRowToEdit = { rowKey: key };
    }
  }

  return onEditRisk;
});