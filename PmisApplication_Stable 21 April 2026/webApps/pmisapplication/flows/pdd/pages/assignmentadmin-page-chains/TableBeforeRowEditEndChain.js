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
     * @param {object} params.changedRow
     */
    async run(context, { event, accept, setUpdatedItem, rowContext, cancelEdit, rowKey, rowIndex, rowData, changedRow }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const updateItem = await $page.variables.projectAssignmentBDP.instance.updateItem({
          metadata: {
            key: rowKey,
          },
          data: changedRow,
          });
    }
  }

  return TableBeforeRowEditEndChain;
});
