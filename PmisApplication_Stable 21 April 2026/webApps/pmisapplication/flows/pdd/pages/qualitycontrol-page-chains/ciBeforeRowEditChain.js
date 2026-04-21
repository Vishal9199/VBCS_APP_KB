define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class ciBeforeRowEditChain extends ActionChain {
    async run(context, { rowKey, rowIndex, rowData }) {
      const { $page, $variables } = context;
      $variables.ciCurrentRow = rowData;
    }
  }

  return ciBeforeRowEditChain;
});