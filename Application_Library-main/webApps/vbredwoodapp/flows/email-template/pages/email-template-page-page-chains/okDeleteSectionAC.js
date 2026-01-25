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

  class deleteSectionYesAction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Get the section_id from dialog property
        const deleteKey = await Actions.callComponentMethod(context, {
          selector: '#deleteSectionDialog',
          method: 'getProperty',
          params: ['primaryKey']
        });

        console.log("=== Deleting Section ===");
        console.log("Primary Key from dialog box:", deleteKey);

        // Encrypt section_id for x-session-id header
        const headerId = await $application.functions.encryptJs(
          $application.constants.secretKey, 
          deleteKey
        );

        // Encrypt 'DELETE' for x-session-code header
        const headerCode = await $application.functions.encryptJs(
          $application.constants.secretKey, 
          'DELETE'
        );

        // Call REST endpoint with encrypted headers (NO BODY)
        const response = await Actions.callRest(context, {
          endpoint: 'Application/postEmailSectionProcess',
          headers: {
            'x-session-id': headerId,
            'x-session-code': headerCode,
          },
        });

        // Check response status
        if (response?.body.P_ERR_CODE === "S") {
          console.log("✓ Section deleted successfully");

          // Show success notification
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'confirmation',
          });

          // Check if deleted section was the currently selected one
          if ($variables.selectedSectionId === deleteKey) {
            // Clear field table since selected section was deleted
            $variables.ADPemailField.data = [];
            $variables.selectedSectionId = 0;
            $variables.paginationField.prev = false;
            $variables.paginationField.next = false;
            console.log("✓ Cleared field table (deleted selected section)");
          }

          // Refresh section table
          await Actions.callChain(context, {
            chain: 'loadChildTableAC',
          });

        } else {
          // Delete failed
          console.log("✗ Delete failed:", response?.body.P_ERR_MSG);

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'error',
          });
        }

        // Close delete confirmation dialog
        await Actions.callComponentMethod(context, {
          selector: '#deleteSectionDialog',
          method: 'close',
        });

      } catch (error) {
        console.error("✗ Exception during delete:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'An error occurred while deleting the section',
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return deleteSectionYesAction;
});