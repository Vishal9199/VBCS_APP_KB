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

  class TableBeforeRowEditChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.rowKey 
     * @param {number} params.rowIndex 
     * @param {any} params.rowData 
     */
    async run(context, { rowKey, rowIndex, rowData }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Populate current row variable for editing
      $variables.lvCurrentRow = JSON.parse(JSON.stringify(rowData));
      
      console.log("TableBeforeRowEdit - Row Key:", rowKey);
      console.log("TableBeforeRowEdit - Row Data:", JSON.stringify(rowData));
    }
  }

  return TableBeforeRowEditChain;
});