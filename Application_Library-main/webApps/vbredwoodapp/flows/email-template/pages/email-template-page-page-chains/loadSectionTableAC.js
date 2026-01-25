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

  class loadSectionTableAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Set template_id in search object for section search
        $variables.searchSectionObj.P_TEMPLATE_ID = $variables.key;

        // Encrypt the search payload
        const encryptJs = await $application.functions.encryptJs(
          $application.constants.secretKey, 
          $variables.searchSectionObj
        );

        $variables.encryptedBody.payload = encryptJs;

        // Call section search endpoint
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS_AOL/postEmailSectionSearch',
          body: $variables.encryptedBody,
        });

        // Check response and populate section table
        if (response?.body?.OUT_STATUS === "SUCCESS") {
          
          // Populate section table ADP
          $variables.ADPemailSection.data = response.body.P_OUTPUT || [];

          // Update section pagination
          $variables.paginationSection.prev = +$variables.searchSectionObj.IN_OFFSET > 0;
          $variables.paginationSection.next = response.body.OUT_HAS_NEXT === "Y";

          // Field table remains empty until user clicks a section row

        } else {
          // Handle error response
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: response?.body?.OUT_DESCRIPTION || 'Failed to load sections',
            type: 'error',
            displayMode: 'transient'
          });
        }

      } catch (error) {
        // Handle REST call failure
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load sections: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return loadSectionTableAC;
});