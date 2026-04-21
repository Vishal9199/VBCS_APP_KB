define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class discBeforeRowEditEndChain extends ActionChain {
    async run(context, { cancelEdit, rowKey, rowIndex, rowData, updatedRow }) {
      const { $page, $variables } = context;

      if (!cancelEdit) {
        await $page.variables.discBufferDP.instance.updateItem({
          metadata: { key: rowKey },
          data: updatedRow,
        });
      }
    }
  }

  return discBeforeRowEditEndChain;
});