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

  class deleteOkFieldAC extends ActionChain {

    /**
     * Action chain to delete email field
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Get the field_id from dialog property
        const deleteKey = await Actions.callComponentMethod(context, {
          selector: '#deleteFieldDialog',
          method: 'getProperty',
          params: ['primaryKey']
        });

        console.log("=== Deleting Field ===");
        console.log("Primary Key from dialog box:", deleteKey);
        console.log("Primary Key type:", typeof deleteKey);

        if (!deleteKey) {
          console.error("✗ No field ID found");
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: 'Field ID not found',
            type: 'error',
            displayMode: 'transient'
          });
          return;
        }

        // Step 1: Fetch the complete field data
        $variables.searchFieldObj.P_FIELD_ID = deleteKey;
        $variables.searchFieldObj.IN_LIMIT = 4;
        $variables.searchFieldObj.IN_OFFSET = 0;

        const encryptedSearchPayload = await $application.functions.encryptJs(
          $application.constants.secretKey,
          $variables.searchFieldObj
        );

        $variables.encryptedBody.payload = encryptedSearchPayload;

        console.log("🔍 Fetching field data for deletion...");

        const fieldResponse = await Actions.callRest(context, {
          endpoint: 'Application/postEmailFieldSearch',
          body: $variables.encryptedBody,
        });

        if (fieldResponse?.body.OUT_STATUS !== "SUCCESS" || 
            !fieldResponse?.body.P_OUTPUT || 
            fieldResponse.body.P_OUTPUT.length === 0) {
          console.error("✗ Failed to fetch field data");
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: 'Failed to retrieve field data for deletion',
            type: 'error',
            displayMode: 'transient'
          });
          return;
        }

        const fieldData = fieldResponse.body.P_OUTPUT[0];
        console.log("✓ Field data retrieved:", JSON.stringify(fieldData, null, 2));

        // Step 2: Prepare delete payload with complete field data
        const deletePayload = {
          field_id: fieldData.field_id,
          section_id: fieldData.section_id,
          section_code: fieldData.section_code,
          template_id: fieldData.template_id,
          template_code: fieldData.template_code,
          field_code: fieldData.field_code,
          field_label: fieldData.field_label,
          field_order: fieldData.field_order,
          column_name: fieldData.column_name,
          display_format: fieldData.display_format,
          is_active: fieldData.is_active
        };

        console.log("Delete payload:", JSON.stringify(deletePayload, null, 2));

        // Step 3: Encrypt the delete payload
        console.log("🔐 Encrypting delete payload...");
        const encryptedPayload = await $application.functions.encryptJs(
          $application.constants.secretKey,
          deletePayload
        );

        $variables.encryptedBody.payload = encryptedPayload;

        console.log("Encrypted payload:", encryptedPayload);

        // Step 4: Encrypt headers
        console.log("🔐 Encrypting headers...");
        console.log("Original deleteKey:", deleteKey, "Type:", typeof deleteKey);
        
        // Try converting to string explicitly (like in save operations)
        const deleteKeyString = String(deleteKey);
        console.log("Converted to string:", deleteKeyString);
        
        const headerId = await $application.functions.encryptJs(
          $application.constants.secretKey, 
          deleteKeyString
        );

        const headerCode = await $application.functions.encryptJs(
          $application.constants.secretKey, 
          'DELETE'
        );

        console.log("✓ Headers encrypted");
        console.log("x-session-id (encrypted):", headerId);
        console.log("x-session-code (encrypted):", headerCode);
        console.log("🌐 Calling REST endpoint...");
        console.log("Endpoint: /email/field/process");
        console.log("Operation: DELETE");

        // Step 5: Call REST endpoint with encrypted headers AND complete body
        const response = await Actions.callRest(context, {
          endpoint: 'Application/postEmailFieldProcess',
          headers: {
            'x-session-id': headerId,
            'x-session-code': headerCode,
          },
          body: $variables.encryptedBody,
        });

        console.log("Response:", JSON.stringify(response.body, null, 2));

        // Step 6: Check response status
        if (response?.body.P_ERR_CODE === "S") {
          console.log("✓ Field deleted successfully");

          // Show success notification
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Field deleted successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });

          // Refresh field table
          await Actions.callChain(context, {
            chain: 'loadEmailFieldAC',
          });

        } else {
          // Delete failed
          console.log("✗ Delete failed:", response?.body.P_ERR_MSG);

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Failed to delete field',
            displayMode: 'transient',
            type: 'error',
          });
        }

        // Close delete confirmation dialog
        await Actions.callComponentMethod(context, {
          selector: '#deleteFieldDialog',
          method: 'close',
        });

      } catch (error) {
        console.error("✗ Exception during delete:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'An error occurred while deleting the field',
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return deleteOkFieldAC;
});