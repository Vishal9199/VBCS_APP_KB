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

  class editSectionIconClick extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.rowData - The section row data to edit
     */
    async run(context, { rowData }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log("=== Edit Section Icon Clicked ===");
        console.log("Section ID:", rowData.section_id);
        console.log("Section Code:", rowData.section_code);

        // Populate emailSectionVar with the selected row data
        $variables.emailSectionVar = {
          section_id: rowData.section_id,
          template_id: rowData.template_id,
          section_code: rowData.section_code,
          section_title: rowData.section_title,
          section_type: rowData.section_type,
          section_order: rowData.section_order,
          view_name: rowData.view_name,
          join_type: rowData.join_type,
          join_column: rowData.join_column,
          is_active: rowData.is_active,
          object_version_num: rowData.object_version_num // Important for optimistic locking
        };
        // Convert Y/N coming from DB to boolean for the switch
        if ($variables.emailSectionVar.is_active = 'Y') {
          $variables.switchflagsection === false;
        } else {
          $variables.switchflagsection === false;
        }


        console.log("✓ Section data loaded into form variable");

        // Reset form validation state
        $variables.isSectionFormValid = 'valid';

        // Open section dialog for editing
        await Actions.callComponentMethod(context, {
          selector: '#sectionDialog',
          method: 'open',
        });

        console.log("✓ Section dialog opened in EDIT mode");

      } catch (error) {
        console.error("✗ Error opening section for edit:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to open section for editing',
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return editSectionIconClick;
});