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

  class cancelDelete extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Close dialog without deleting

      const deleteDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'close',
      });

      // Clear stored values
      $variables.deleteRowKey = null;
      $variables.deleteRowIndex = null;

      console.log("cancelDelete - Delete operation cancelled");
    }
  }

  return cancelDelete;
});