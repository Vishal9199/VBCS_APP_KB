define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class openDeleteDialogAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.rowKey
     * @param {FutureProjectType} params.rowData
     */
    async run(context, { rowKey, rowData }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Capture the row to be deleted
      $variables.lvCurrentRow = rowData;

      // Open confirm dialog
      document.getElementById('deleteDialog').open();
    }
  }

  return openDeleteDialogAC;
});