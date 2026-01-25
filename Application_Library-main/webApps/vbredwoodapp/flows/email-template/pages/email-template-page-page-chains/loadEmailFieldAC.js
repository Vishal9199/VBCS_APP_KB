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

  class loadEmailFieldAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.sectionCode - Optional section code for notification messages
     */
    async run(context, { sectionCode = '' } = {}) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        await Actions.resetVariables(context, {
          variables: [
    '$variables.searchFieldObj.P_FIELD_ID',
  ],
        });

        // Prepare search object for fields
        // $variables.searchFieldObj.IN_OFFSET = 0;
        // $variables.searchFieldObj.IN_LIMIT = 4; // Load 50 fields per page

        console.log("=== Loading Email Fields ===");
        console.log("Section ID:", $variables.searchFieldObj.P_SECTION_ID);
        console.log("Offset:", $variables.searchFieldObj.IN_OFFSET);
        console.log("Limit:", $variables.searchFieldObj.IN_LIMIT);

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
          // Populate field table with results
          $variables.ADPemailField.data = fieldResponse.body.P_OUTPUT || [];

          // Set pagination flags
          $variables.paginationField.prev = +$variables.searchFieldObj.IN_OFFSET > 0;
          $variables.paginationField.next = fieldResponse.body.OUT_HAS_NEXT === "Y";

          console.log("✓ Field table loaded:", $variables.ADPemailField.data.length, "fields");
          console.log("✓ Pagination - Prev:", $variables.paginationField.prev, "Next:", $variables.paginationField.next);

          // // Show success notification
          // if ($variables.ADPemailField.data.length > 0) {
          //   await Actions.fireNotificationEvent(context, {
          //     summary: 'Fields Loaded',
          //     message: sectionCode 
          //       ? `Loaded ${$variables.ADPemailField.data.length} fields for section: ${sectionCode}`
          //       : `Loaded ${$variables.ADPemailField.data.length} fields`,
          //     type: 'confirmation',
          //     displayMode: 'transient'
          //   });
          // } else {
          //   // Section has no fields
          //   await Actions.fireNotificationEvent(context, {
          //     summary: 'No Fields',
          //     message: sectionCode 
          //       ? `Section "${sectionCode}" has no fields configured`
          //       : 'No fields found',
          //     type: 'info',
          //     displayMode: 'transient'
          //   });
          // }

        } else {
          // API returned error
          console.log("✗ Error loading fields:", fieldResponse?.body.OUT_DESCRIPTION);
          
          // Clear field table and pagination flags
          $variables.ADPemailField.data = [];
          $variables.paginationField.prev = false;
          $variables.paginationField.next = false;
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: fieldResponse?.body.OUT_DESCRIPTION || 'Failed to load fields',
            type: 'error',
            displayMode: 'transient'
          });
        }

      } catch (error) {
        // Exception occurred
        console.error("✗ Exception in loadEmailFieldAC:", error);
        
        // Clear field table and pagination flags
        $variables.ADPemailField.data = [];
        $variables.paginationField.prev = false;
        $variables.paginationField.next = false;
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'An error occurred while loading field details',
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return loadEmailFieldAC;
});