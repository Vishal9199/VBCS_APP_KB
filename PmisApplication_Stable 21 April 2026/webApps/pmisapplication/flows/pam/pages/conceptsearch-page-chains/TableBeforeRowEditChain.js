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
     * @param {any} params.rowData
     * @param {number} params.rowIndex
     * @param {any} params.rowKey
     */
    async run(context, { rowData, rowIndex, rowKey }) {
      const { $page, $flow, $application, $variables } = context;

      $variables.lvCurrentRow = rowData;
   
    }
  }

  return TableBeforeRowEditChain;
});