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

  class fieldLoadOnTableClickAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.rowKey - The selected row key
     * @param {any} params.rowData - The selected row data
     */
    async run(context, { rowKey, rowData }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Extract section_id from selected row
        $variables.searchFieldObj.P_SECTION_ID = rowData.section_id;
        
        $variables.emailFieldColumnLovVar = rowData.view_name;

        console.log("=== Section Row Selected ===");
        console.log("Section ID:", rowData.section_id);
        console.log("Section Code:", rowData.section_code);
        console.log("Section Title:", rowData.section_title);

        // Call the reusable loadEmailFieldAC action chain
        await Actions.callChain(context, {
          chain: 'loadEmailFieldAC',
        });

      } catch (error) {
        console.error("✗ Exception in fieldLoadOnTableClickAC:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'An error occurred while processing section selection',
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return fieldLoadOnTableClickAC;
});