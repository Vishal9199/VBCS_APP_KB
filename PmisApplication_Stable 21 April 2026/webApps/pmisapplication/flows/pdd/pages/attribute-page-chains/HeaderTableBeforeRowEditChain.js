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

  class HeaderTableBeforeRowEditChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.rowKey 
     * @param {number} params.rowIndex 
     * @param {any} params.rowData 
     */
    async run(context, { rowKey, rowIndex, rowData }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Populate current row variable with the data being edited
      $variables.lvCurrentHeaderRow = rowData;
      
      console.log("Editing Header Row:", JSON.stringify(rowData));
    }
  }

  return HeaderTableBeforeRowEditChain;
});