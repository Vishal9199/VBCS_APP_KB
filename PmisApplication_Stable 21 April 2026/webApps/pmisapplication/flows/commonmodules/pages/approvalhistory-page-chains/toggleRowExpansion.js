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

  class toggleRowExpansion extends ActionChain {
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.parentId - ID of parent row to toggle
     */
    async run(context, { parentId }) {
      const { $variables } = context;

      console.log("=== Toggle Row Expansion ===");
      console.log("Parent ID:", parentId);
      console.log("Current state:", $variables.expandedRows[parentId]);

      // Toggle expansion state
      $variables.expandedRows[parentId] = !$variables.expandedRows[parentId];

      console.log("New state:", $variables.expandedRows[parentId]);

      // Recalculate visible rows
      const visibleRows = this.getVisibleRows(
        $variables.allRowsData,
        $variables.expandedRows
      );

      console.log("Visible rows after toggle:", visibleRows.length);

      // Update ADP
      $variables.approvalHistoryADP.data = visibleRows;

      // Force refresh
      await Actions.fireDataProviderEvent(context, {
        target: $variables.approvalHistoryADP,
        refresh: null
      });
    }

    /**
     * Get visible rows based on expansion state
     */
    getVisibleRows(allRows, expandedState) {
      const visible = [];
      
      allRows.forEach(row => {
        if (row.isParent) {
          visible.push(row);
        } else if (row.isChild && expandedState[row.parentId]) {
          visible.push(row);
        }
      });
      
      return visible;
    }
  }

  return toggleRowExpansion;
});