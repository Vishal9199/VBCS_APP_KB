define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class qaBeforeRowEditChain extends ActionChain {
    async run(context, { rowKey, rowIndex, rowData }) {
      const { $page, $variables } = context;

      $variables.qaCurrentRow = rowData;

      console.log("TableBeforeRowEdit - Row Key:", rowKey);
      console.log("TableBeforeRowEdit - Row Data:", JSON.stringify(rowData));
    }
  }

  return qaBeforeRowEditChain;
});