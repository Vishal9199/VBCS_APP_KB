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

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.accept
     * @param {any} params.setUpdatedItem
     * @param {object} params.rowContext
     * @param {any} params.cancelEdit
     * @param {any} params.rowKey
     * @param {number} params.rowIndex
     * @param {any} params.rowData
     */
    async run(context, { changedRow, cancelEdit, event, rowData, rowKey, rowIndex }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;
      $variables.count = $variables.count + 1;


      const updateItem2 = await $page.variables.bufferDPStakeholderTable.instance.updateItem({
        metadata: {
          key: rowKey,
        },
        data: changedRow,
      });
    }
  }
  return TableBeforeRowEditEndChain;
});
