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

  class onClickDeleteEmailFieldAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.rowData - The field row data to delete
     */
    async run(context, { rowData }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log("=== Delete Field Icon Clicked ===");
        console.log("Field ID:", rowData.field_id);
        console.log("Field Code:", rowData.field_code);
        console.log("Field Label:", rowData.field_label);

        // 🔑 SET THE PRIMARY KEY ON THE DIALOG
        await Actions.callComponentMethod(context, {
          selector: '#deleteFieldDialog',
          method: 'setProperty',
          params: ['primaryKey', rowData.field_id]
        });

        console.log("✓ Primary key set on dialog:", rowData.field_id);

        // Open delete confirmation dialog
        await Actions.callComponentMethod(context, {
          selector: '#deleteFieldDialog',
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

  return onClickDeleteEmailFieldAC;
});