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

  class saveEmailSectionAC extends ActionChain {

    /**
     * Core save logic for section (called by other save chains)
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log("=== Save Section (Core Logic) ===");

        // Step 1: Validate form
        await Actions.callComponentMethod(context, {
          selector: '#sectionForm',
          method: 'validate',
        });

        // Check validation result
        if ($variables.isSectionFormValid === 'valid') {
          console.log("✓ Form validation passed");
        } else {
          console.log("✗ Form validation failed:", $variables.isSectionFormValid);
          return; // Stop execution if validation fails
        }

        // Step 2: Get dialog method (kept for reference)
        const dialogMethod = await Actions.callComponentMethod(context, {
          selector: '#sectionDialog',
          method: 'getProperty',
          params: ['method'],
        });

        console.log("📝 Dialog method:", dialogMethod);

        // Step 3: Determine operation based on section_id
        const sectionId = $variables.emailSectionVar.section_id || 0;
        
        // ✅ FIXED: Use POST/PUT instead of INSERT/UPDATE
        const operation = sectionId === 0 ? "POST" : "PUT";
        
        console.log("Operation:", operation, ", Section ID:", sectionId);

        // Step 4: Set template_id from URL parameter
        $variables.emailSectionVar.template_id = $variables.key;

        // Step 5: For new records, set section_id = 0 and created fields
        if (operation === "POST") {
          $variables.emailSectionVar.section_id = 0;
          $variables.emailSectionVar.created_by = $application.user.fullName;
          $variables.emailSectionVar.created_date = await $application.functions.getSysdate();

          console.log("📝 New record - setting created_by fields");
          console.log("created_by:", $application.user.fullName);
          console.log("created_date:", $variables.emailSectionVar.created_date);
        }

        // Step 6: Always set last_updated fields
        console.log("📝 Setting last_updated fields...");
        $variables.emailSectionVar.last_updated_by = $application.user.fullName;
        $variables.emailSectionVar.last_updated_date = await $application.functions.getSysdate();
        $variables.emailSectionVar.last_updated_login = $application.user.email;

        console.log("last_updated_by:", $variables.emailSectionVar.last_updated_by);
        console.log("last_updated_date:", $variables.emailSectionVar.last_updated_date);
        // Step 7: Convert is_active to Y/N
      
if ($variables.switchflagsection === true) {
    $variables.emailSectionVar.is_active = 'Y';
} else {
    $variables.emailSectionVar.is_active = 'N';
}


        // Step 8: Encrypt payload
        console.log("🔐 Encrypting payload...");
        console.log("Payload before encryption:", JSON.stringify($variables.emailSectionVar, null, 2));




        const encryptedPayload = await $application.functions.encryptJs(
          $application.constants.secretKey,
          $variables.emailSectionVar
        );

        $variables.encryptedBody.payload = encryptedPayload;

        console.log("Encrypted payload:", encryptedPayload);

        // Step 9: Encrypt headers
        const encryptedSessionId = await $application.functions.encryptJs(
          $application.constants.secretKey,
          sectionId.toString()
        );

        const encryptedOperation = await $application.functions.encryptJs(
          $application.constants.secretKey,
          operation
        );

        console.log("🌐 Calling REST endpoint...");
        console.log("Endpoint: /email/section/process");
        console.log("Operation:", operation);

        // Step 10: Call REST API
        const response = await Actions.callRest(context, {
          endpoint: 'Application/postEmailSectionProcess',
          headers: {
            'x-session-id': encryptedSessionId,
            'x-session-code': encryptedOperation,
          },
          body: $variables.encryptedBody,
        });

        console.log("Response:", JSON.stringify(response.body, null, 2));

        // Step 11: Check response
        if (response.body.P_ERR_CODE === "S") {
          console.log("✓ Section saved successfully");

          // Show success notification (transient - auto-dismiss)
          await Actions.fireNotificationEvent(context, {
            summary: operation === "POST" ? 
              'Section created successfully' : 
              'Section updated successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });

          await Actions.callChain(context, {
            chain: 'loadChildTableAC',
          });

        } else {
          // Error - show persistent notification
          console.log("✗ Save failed:", response.body.P_ERR_MSG);

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Failed to save section',
            displayMode: 'persist',
            type: 'error',
          });
        }

      } catch (error) {
        console.error("❌ Error in saveEmailSectionAC:", error);

        await Actions.fireNotificationEvent(context, {
          summary: 'An unexpected error occurred while saving the section',
          displayMode: 'persist',
          type: 'error',
        });
      }
    }
  }

  return saveEmailSectionAC;
});