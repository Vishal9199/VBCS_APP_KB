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

  class BudgetBeforeRowEditChain extends ActionChain {

    /**
     * Fires when a table row enters edit mode.
     * Populates lvBudgetCurrentRow with the row data being edited.
     *
     * @param {Object} context
     * @param {Object} params
     * @param {any}    params.rowKey
     * @param {number} params.rowIndex
     * @param {any}    params.rowData
     */
    async run(context, { rowKey, rowIndex, rowData }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.lvBudgetCurrentRow = rowData;

      console.log('BudgetBeforeRowEdit - Row Key:', rowKey);
      console.log('BudgetBeforeRowEdit - Row Data:', JSON.stringify(rowData));
    }
  }

  return BudgetBeforeRowEditChain;
});