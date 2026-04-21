define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onDeleteIssue extends ActionChain {

    async run(context, { key, current }) {
      const { $page, $variables } = context;

      // Negative key = unsaved new row — remove from BDP directly, no confirmation
      if (key < 0) {
        await $page.variables.issueBufferDP.instance.removeItem({
          metadata: { key: key },
          data: current.row,
        });
        console.log('onDeleteIssue: unsaved row removed, key=', key);
        return;
      }

      // Positive key = existing DB record — show confirmation dialog first
      $variables.lvDeleteKey = key;
      $variables.lvDeleteRowData = { ...current.row };
      document.getElementById('issueConfirmDialog').open();
      console.log('onDeleteIssue: confirmation dialog opened for key=', key);
    }
  }

  return onDeleteIssue;
});