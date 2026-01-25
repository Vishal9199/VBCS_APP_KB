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

  class editFieldAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.rowData - The field row data to edit
     */
    async run(context, { rowData }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        $variables.sectionEdit = true;

        console.log("=== Edit Field Icon Clicked ===");
        console.log("Row Data received:", JSON.stringify(rowData, null, 2));
        console.log("Field ID:", rowData.field_id);
        console.log("Field Code:", rowData.field_code);
        console.log("Field Label:", rowData.field_label);

        // Populate emailFieldVar with the selected row data
        $variables.emailFieldVar = {
          field_id: rowData.field_id,
          section_id: rowData.section_id,
          field_code: rowData.field_code,
          field_label: rowData.field_label,
          field_order: rowData.field_order,
          column_name: rowData.column_name,
          display_format: rowData.display_format,
          is_active: rowData.is_active,
          created_by: rowData.created_by,
          created_date: rowData.created_date,
          last_updated_by: rowData.last_updated_by,
          last_updated_date: rowData.last_updated_date,
          last_updated_login: rowData.last_updated_login
        };

        console.log("✓ emailFieldVar populated:", JSON.stringify($variables.emailFieldVar, null, 2));

        // Convert Y/N coming from DB to boolean for the switch
        console.log("Converting is_active:", $variables.emailFieldVar.is_active);
        
        if ($variables.emailFieldVar.is_active === 'Y') {
          $variables.switchflagfield = true;
        } else {
          $variables.switchflagfield = false;
        }

        console.log("✓ Field data loaded into form variable");
        console.log("Active status (switch):", $variables.switchflagfield);
        console.log("Active status type:", typeof $variables.switchflagfield);

        // Reset form validation state
        console.log("Resetting form validation state...");
        $variables.isFieldFormValid = undefined;
        console.log("isFieldFormValid set to:", $variables.isFieldFormValid);

        // Set dialog method to PUT for edit mode
        console.log("Setting dialog method to PUT...");
        await Actions.callComponentMethod(context, {
          selector: '#emailFieldDialog',
          method: 'setProperty',
          params: ['method', 'PUT']
        });

        console.log("✓ Dialog method set to PUT");

        // Verify dialog method was set
        const dialogMethod = await Actions.callComponentMethod(context, {
          selector: '#emailFieldDialog',
          method: 'getProperty',
          params: ['method']
        });
        console.log("Dialog method verified:", dialogMethod);

        // Open field dialog for editing
        console.log("Opening email field dialog...");
        await Actions.callComponentMethod(context, {
          selector: '#emailFieldDialog',
          method: 'open',
        });

        console.log("✓ Field dialog opened in EDIT mode");
        console.log("=== Edit Field Action Complete ===");

      } catch (error) {
        console.error("✗ Error opening field for edit:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to open field for editing',
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return editFieldAC;
});