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

  class divMouseoverChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.data
     */
    async run(context, { event, data }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Exit early if same cell
      if ($variables.inputTable.columns === data?.col && $variables.inputTable.rows === data?.row) {
        return;
      }

      $variables.inputTable.columns = data?.col;
      $variables.inputTable.rows = data?.row;

      const maxCol = data?.col;
      const maxRow = data?.row;

      const cells = $variables.matrixData;

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const shouldSelect = cell.row <= maxRow && cell.col <= maxCol;

        // Update ONLY if value changes
        if (cell.selected !== shouldSelect) {
          cell.selected = shouldSelect;
        }
      }

    }
  }

  return divMouseoverChain;
});
