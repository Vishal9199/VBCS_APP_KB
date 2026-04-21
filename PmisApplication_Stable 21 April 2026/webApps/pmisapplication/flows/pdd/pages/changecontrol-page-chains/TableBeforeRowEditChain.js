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

  class TableBeforeRowEditChain extends ActionChain {

    async run(context, { event, accept, rowContext, rowKey, rowIndex, rowData }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.lvCurrentChangeControlRow = rowData;
    }
  }

  return TableBeforeRowEditChain;
});