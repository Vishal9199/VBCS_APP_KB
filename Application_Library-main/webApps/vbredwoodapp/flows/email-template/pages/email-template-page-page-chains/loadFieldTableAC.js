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

  class loadFieldTableAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Check if a section is selected
        if (!$variables.selectedSectionId) {
          console.log("No section selected - field table empty");
          $variables.ADPemailField.data = [];
          return;
        }

        console.log("Loading Fields - Section ID:", $variables.selectedSectionId);
        console.log("Offset:", $variables.searchFieldObj.IN_OFFSET);

        // Prepare search object for fields
        $variables.searchFieldObj.P_SECTION_ID = $variables.selectedSectionId;

        // Encrypt the payload
        const encryptedFieldPayload = await $application.functions.encryptJs(
          $application.constants.secretKey, 
          $variables.searchFieldObj
        );

        $variables.encryptedBody.payload = encryptedFieldPayload;

        // Call REST to get field data
        const fieldResponse = await Actions.callRest(context, {
          endpoint: 'Application/postEmailFieldSearch',
          body: $variables.encryptedBody,
        });

        if (fieldResponse?.body.OUT_STATUS === "SUCCESS") {
          // Populate field table
          $variables.ADPemailField.data = fieldResponse.body.P_OUTPUT || [];

          // Set pagination flags
          $variables.paginationField.prev = +$variables.searchFieldObj.IN_OFFSET > 0;
          $variables.paginationField.next = fieldResponse.body.OUT_HAS_NEXT === "Y";

          console.log("✓ Field table loaded:", $variables.ADPemailField.data.length, "fields");

        } else {
          // No fields found or error
          console.log("✗ No fields found:", fieldResponse?.body.OUT_DESCRIPTION);
          
          // Clear field table
          $variables.ADPemailField.data = [];
          $variables.paginationField.prev = false;
          $variables.paginationField.next = false;
        }

      } catch (error) {
        console.error("✗ Error loading fields:", error);
        
        // Clear field table on error
        $variables.ADPemailField.data = [];
        $variables.paginationField.prev = false;
        $variables.paginationField.next = false;
      }
    }
  }

  return loadFieldTableAC;
});