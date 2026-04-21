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

  class HeaderTableBeforeRowEditEndChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.cancelEdit 
     * @param {any} params.rowKey 
     * @param {number} params.rowIndex 
     * @param {any} params.rowData 
     * @param {HeaderAttributeType} params.updatedRow 
     */
    async run(context, { cancelEdit, rowKey, rowIndex, rowData, updatedRow }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Update the item in BufferingDataProvider
      await $page.variables.bufferDPHeaderTable.instance.updateItem({
        metadata: {
          key: rowKey,
        },
        data: updatedRow,
      });
      
      console.log("Updated Header Row:", JSON.stringify(updatedRow));
    }
  }

  return HeaderTableBeforeRowEditEndChain;
});