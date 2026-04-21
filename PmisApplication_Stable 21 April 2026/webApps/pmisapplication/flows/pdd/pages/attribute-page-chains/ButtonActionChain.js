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

  class ButtonActionChain extends ActionChain {

    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Set the current row data for editing
      $variables.lvCurrentHeaderRow = { ...current.data };

      // Set edit-row to trigger inline edit mode
      $page.variables.rowToEdit.rowKey = key;
    }
  }

  return ButtonActionChain;
});