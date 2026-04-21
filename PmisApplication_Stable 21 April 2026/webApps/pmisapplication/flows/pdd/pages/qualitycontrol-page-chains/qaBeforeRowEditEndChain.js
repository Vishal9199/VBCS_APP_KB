define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class qaBeforeRowEditEndChain extends ActionChain {
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.cancelEdit
     * @param {any} params.rowKey
     * @param {number} params.rowIndex
     * @param {any} params.rowData
     * @param {any} params.updatedRow
     */
    async run(context, { cancelEdit, rowKey, rowIndex, rowData, updatedRow }) {
      const { $page, $variables } = context;

      console.log("QA Updated Data 1st: ", JSON.stringify(updatedRow));

      if (!cancelEdit) {
        await $page.variables.qaBufferDP.instance.updateItem({
          metadata: { key: rowKey },
          data: updatedRow,
        });
      }

      console.log("QA Updated Data 2nd: ", JSON.stringify(updatedRow));
    }
  }

  return qaBeforeRowEditEndChain;
});