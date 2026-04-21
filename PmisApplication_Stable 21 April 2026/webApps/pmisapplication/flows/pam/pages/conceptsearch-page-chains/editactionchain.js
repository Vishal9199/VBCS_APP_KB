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

  class editactionchain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Get the row data using the current parameter
      const rowData = current.data;

      // Set the current row data for editing
      $variables.lvCurrentRow = { ...rowData };

      // Set the edit-row object with both rowKey and rowIndex
      $variables.rowToEdit = {
        rowKey: key,
        rowIndex: index
      };
    }
  }

  return editactionchain;
});