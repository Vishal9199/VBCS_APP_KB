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

  class loadChildTableAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log("Loading Sections for Template ID:", $variables.key);

        // Prepare search object for sections
        $variables.searchSectionObj.TEMPLATE_ID = $variables.key;
        // $variables.searchSectionObj.IN_OFFSET = 0;

        // Encrypt the payload
        const encryptedSectionPayload = await $application.functions.encryptJs(
          $application.constants.secretKey, 
          $variables.searchSectionObj
        );

        $variables.encryptedBody.payload = encryptedSectionPayload;

        // Call REST to get section data
        const sectionResponse = await Actions.callRest(context, {
          endpoint: 'Application/postEmailSectionSearch',
          body: $variables.encryptedBody,
        });

        if (sectionResponse?.body.OUT_STATUS === "SUCCESS") {
          // Populate section table
          $variables.ADPemailSection.data = sectionResponse.body.P_OUTPUT || [];
         

          

          // Set pagination flags
          $variables.paginationSection.prev = +$variables.searchSectionObj.IN_OFFSET > 0;
          $variables.paginationSection.next = sectionResponse.body.OUT_HAS_NEXT === "Y";

          console.log("Section table loaded:", $variables.ADPemailSection.data.length, "sections");

          // Keep field table empty until user clicks a section row
          $variables.ADPemailField.data = [];
          $variables.selectedSectionId = 0;

        } else {
          // No sections found or error
          console.log("No sections found or error:", sectionResponse?.body.OUT_DESCRIPTION);
          
          // Initialize empty section table
          $variables.ADPemailSection.data = [];
          $variables.ADPemailField.data = [];
        }

      } catch (error) {
        console.error("Error loading sections:", error);
        
        // Initialize empty tables on error
        $variables.ADPemailSection.data = [];
        $variables.ADPemailField.data = [];
      }
    }
  }

  return loadChildTableAC;
});