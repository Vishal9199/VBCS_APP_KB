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

  class saveSectionAddAnotherAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Call the actual save logic
      await Actions.callChain(context, {
        chain: 'saveEmailSectionAC',
      });

      // Refresh the section table
      await Actions.callChain(context, {
        chain: 'loadChildTableAC',
      });

      // Reset the form for new entry
      await Actions.resetVariables(context, {
        variables: [
          '$variables.emailSectionVar',
        ],
      });

      // Set defaults for new record
      $variables.emailSectionVar.section_id = 0;
      $variables.emailSectionVar.template_id = +$variables.key;
      

      console.log("✓ Form reset for new entry - Dialog stays open");
    }
  }

  return saveSectionAddAnotherAC;
});