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

  class addEmailFieldAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.sectionEdit = false;

      // Step 1: Reset/Initialize emailFieldVar for new record
      $variables.emailFieldVar = {
        field_id: 0,
        section_id: $variables.searchFieldObj.P_SECTION_ID, // Parent section
        field_code: '',
        field_label: '',
        field_order: 0,
        column_name: '',
        display_format: '',
        is_active: 'Y',
        created_by: '',
        created_date: '',
        last_updated_by: '',
        last_updated_date: '',
        last_updated_login: ''
      };

      // Step 2: Reset form validation state
      $variables.isFieldFormValid = undefined;

      // Step 3: Set switch flag to true (active by default)
      $variables.switchflagfield = true;

      console.log("=== Add Email Field ===");
      console.log("Initialized emailFieldVar for new field");
      console.log("Parent Section ID:", $variables.searchFieldObj.P_SECTION_ID);

      // Step 4: Open dialog
      const emailFieldDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#emailFieldDialog',
        method: 'open',
      });
    }
  }

  return addEmailFieldAC;
});