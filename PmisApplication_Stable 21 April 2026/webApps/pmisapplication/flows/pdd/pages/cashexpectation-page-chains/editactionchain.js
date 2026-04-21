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

    async run(context, { event, originalEvent, key, index, current }) {
      const { $page } = context;

      // ✅ Use current.row (not current.data)
      const rowData = current.row ?? current.data ?? {};

      // ✅ Use $page.variables (not $variables)
      $page.variables.lvCurrentcashExpRow = { ...rowData };

      // ✅ rowToEdit only needs rowKey (your type only has rowKey)
      $page.variables.rowToEdit = {
        rowKey: key
      };
    }
  }

  return editactionchain;
});