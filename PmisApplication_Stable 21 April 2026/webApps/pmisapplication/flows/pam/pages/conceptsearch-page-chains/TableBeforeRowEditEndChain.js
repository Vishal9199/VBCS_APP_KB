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

  class TableBeforeRowEditEndChain extends ActionChain {

    // async run(context) {
    //   const { $page, $flow, $application, $variables } = context;
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.changedRow
     * @param {any} params.cancelEdit
     * @param {any} params.event
     * @param {any} params.rowData
     * @param {any} params.rowKey
     * @param {number} params.rowIndex
     */
    async run(context, { changedRow, cancelEdit, event, rowData, rowKey, rowIndex }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;
      $variables.count = $variables.count + 1;


      const updateItem2 = await $page.variables.bufferDPTable.instance.updateItem({
        metadata: {
          key: rowKey,
        },
        data: changedRow,
      });
    }

    // ========== UPDATE EXISTING RECORD ==========
   
  }

  return TableBeforeRowEditEndChain;
});