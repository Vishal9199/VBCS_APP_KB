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

  class saveEmailFieldAC extends ActionChain {

    /**
     * Core save logic for email field (called by other save chains)
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log("=== Save Email Field (Core Logic) ===");

        // Step 1: Validate form
        await Actions.callComponentMethod(context, {
          selector: '#fieldForm',
          method: 'validate',
        });

        // Check validation result
        if ($variables.isFieldFormValid === 'valid') {
          console.log("✓ Form validation passed");
        } else {
          console.log("✗ Form validation failed:", $variables.isFieldFormValid);
          return; // Stop execution if validation fails
        }

        // Step 2: Determine operation based on field_id
        const fieldId = $variables.emailFieldVar.field_id || 0;
        
        const operation = fieldId === 0 ? "POST" : "PUT";
        
        console.log("Operation:", operation, ", Field ID:", fieldId);

        // Step 3: Set section_id from search object (parent section)
        $variables.emailFieldVar.section_id = $variables.searchFieldObj.P_SECTION_ID;

        // Step 4: For new records, set field_id = 0 and created fields
        if (operation === "POST") {
          $variables.emailFieldVar.field_id = 0;
          $variables.emailFieldVar.created_by = $application.user.fullName;
          $variables.emailFieldVar.created_date = await $application.functions.getSysdate();

          console.log("📝 New record - setting created_by fields");
          console.log("created_by:", $application.user.fullName);
          console.log("created_date:", $variables.emailFieldVar.created_date);
        }

        // Step 5: Always set last_updated fields
        console.log("📝 Setting last_updated fields...");
        $variables.emailFieldVar.last_updated_by = $application.user.fullName;
        $variables.emailFieldVar.last_updated_date = await $application.functions.getSysdate();
        $variables.emailFieldVar.last_updated_login = $application.user.email;

        console.log("last_updated_by:", $variables.emailFieldVar.last_updated_by);
        console.log("last_updated_date:", $variables.emailFieldVar.last_updated_date);

        // Step 6: Convert is_active to Y/N
        if ($variables.switchflagfield === true) {
          $variables.emailFieldVar.is_active = 'Y';
        } else {
          $variables.emailFieldVar.is_active = 'N';
        }

        // Step 7: Encrypt payload
        console.log("🔐 Encrypting payload...");
        console.log("Payload before encryption:", JSON.stringify($variables.emailFieldVar, null, 2));

        const encryptedPayload = await $application.functions.encryptJs(
          $application.constants.secretKey,
          $variables.emailFieldVar
        );

        $variables.encryptedBody.payload = encryptedPayload;

        console.log("Encrypted payload:", encryptedPayload);

        // Step 8: Encrypt headers
        const encryptedSessionId = await $application.functions.encryptJs(
          $application.constants.secretKey,
          fieldId.toString()
        );

        const encryptedOperation = await $application.functions.encryptJs(
          $application.constants.secretKey,
          operation
        );

        console.log("🌐 Calling REST endpoint...");
        console.log("Endpoint: /email/field/process");
        console.log("Operation:", operation);

        // Step 9: Call REST API
        const response = await Actions.callRest(context, {
          endpoint: 'Application/postEmailFieldProcess',
          headers: {
            'x-session-id': encryptedSessionId,
            'x-session-code': encryptedOperation,
          },
          body: $variables.encryptedBody,
        });

        console.log("Response:", JSON.stringify(response.body, null, 2));

        // Step 10: Check response
        if (response.body.P_ERR_CODE === "S") {
          console.log("✓ Field saved successfully");

          // Show success notification (transient - auto-dismiss)
          await Actions.fireNotificationEvent(context, {
            summary: operation === "POST" ? 
              'Field created successfully' : 
              'Field updated successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });

          // Reload the field table
          await Actions.callChain(context, {
            chain: 'loadEmailFieldAC',
          });

        } else {
          // Error - show persistent notification
          console.log("✗ Save failed:", response.body.P_ERR_MSG);

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Failed to save field',
            displayMode: 'persist',
            type: 'error',
          });
        }

      } catch (error) {
        console.error("❌ Error in saveEmailFieldAC:", error);

        await Actions.fireNotificationEvent(context, {
          summary: 'An unexpected error occurred while saving the field',
          displayMode: 'persist',
          type: 'error',
        });
      }
    }
  }

  return saveEmailFieldAC;
});