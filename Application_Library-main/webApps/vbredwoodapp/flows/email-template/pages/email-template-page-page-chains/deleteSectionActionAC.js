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

  class deleteSectionIconClick extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.rowData - The section row data to delete
     */
    async run(context, { rowData }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log("=== Delete Section Icon Clicked ===");
        console.log("Section ID:", rowData.section_id);
        console.log("Section Code:", rowData.section_code);

        // 🔑 SET THE PRIMARY KEY ON THE DIALOG (THIS WAS MISSING!)
        await Actions.callComponentMethod(context, {
          selector: '#deleteSectionDialog',
          method: 'setProperty',
          params: ['primaryKey', rowData.section_id]
        });

        console.log("✓ Primary key set on dialog:", rowData.section_id);

        // Open delete confirmation dialog
        await Actions.callComponentMethod(context, {
          selector: '#deleteSectionDialog',
          method: 'open',
        });

        console.log("✓ Delete confirmation dialog opened");

      } catch (error) {
        console.error("✗ Error opening delete confirmation:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to open delete confirmation',
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return deleteSectionIconClick;
});