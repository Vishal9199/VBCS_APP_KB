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

  class addSectionBtnAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      try {
        console.log("=== Add Section Button Clicked ===");

        // ✅ Check if header is new and not yet saved
        if ($variables.method === "POST") {
          console.log("⚠️ Header not saved yet - saving header first");
          
          const status = await Actions.callChain(context, {
            chain: 'emailTemplateAddEditAC',
          });

          if (status !== "S") {
            console.log("✗ Header save failed - cannot add section");
            return;
          }
          
          console.log("✓ Header saved successfully");
        }

        // ✅ Header is saved - proceed with section
        console.log("✓ Header is saved - initializing section form");

        // Reset section variable to clear any previous data
        await Actions.resetVariables(context, {
          variables: [
            '$variables.emailSectionVar',
          ],
        });

        // Set default values for new section
        $variables.emailSectionVar.section_id = 0;
        $variables.emailSectionVar.template_id = $variables.key;
        $variables.emailSectionVar.is_active = 'Y';

        console.log("✓ Section form initialized for ADD mode");
        console.log("Template ID:", $variables.emailSectionVar.template_id);

        // Reset form validation state
        $variables.isSectionFormValid = 'valid';

        // Open section dialog
        await Actions.callComponentMethod(context, {
          selector: '#sectionDialog',
          method: 'open',
        });

        console.log("✓ Section dialog opened");

      } catch (error) {
        console.error("✗ Error in add section action chain:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to open section form: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return addSectionBtnAC;
});