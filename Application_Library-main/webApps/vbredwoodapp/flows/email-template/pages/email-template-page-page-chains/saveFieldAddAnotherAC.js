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

  class saveFieldAddAnotherAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Call the actual save logic
      await Actions.callChain(context, {
        chain: 'saveEmailFieldAC',
      });

      // Reset the form for new entry
      await Actions.resetVariables(context, {
        variables: [
          '$variables.emailFieldVar',
        ],
      });

      // Set defaults for new record
      $variables.emailFieldVar.field_id = 0;
      $variables.emailFieldVar.section_id = $variables.searchFieldObj.P_SECTION_ID; // Parent section
      
      // Only default to true for NEW record
      if ($variables.emailFieldVar.field_id === 0) {
        $variables.switchflagfield = true;   // boolean for the switch
      }
      
      $variables.emailFieldVar.field_order = 1;
      $variables.emailFieldVar.field_code = '';
      $variables.emailFieldVar.field_label = '';
      $variables.emailFieldVar.column_name = '';
      $variables.emailFieldVar.display_format = '';
      $variables.emailFieldVar.is_active = 'Y';

      console.log("✓ Form reset for new entry - Dialog stays open");
      console.log("Parent Section ID:", $variables.searchFieldObj.P_SECTION_ID);
    }
  }

  return saveFieldAddAnotherAC;
});