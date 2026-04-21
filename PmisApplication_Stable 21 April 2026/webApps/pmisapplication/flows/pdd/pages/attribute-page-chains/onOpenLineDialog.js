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

  class onOpenLineDialog extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.headerKey 
     */
    async run(context, { headerKey }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Store the selected header row key
        $variables.selectedHeaderRowKey = headerKey;
        
        console.log("Opening line dialog for Header ID:", headerKey);
        
        // Reset line attribute variable
        await Actions.resetVariables(context, {
          variables: [
            '$variables.lineAttributeVar',
          ],
        });
        
        // Load existing line items for this header (if any)
        // TODO: Call REST API to get line items
        // const response = await Actions.callRest(context, {
        //   endpoint: 'LineService/getLinesByHeader',
        //   uriParams: {
        //     headerId: headerKey
        //   }
        // });
        
        // if (response.body && response.body.items) {
        //   $variables.ADPLineTable.data = response.body.items;
        // }
        
        // Open the dialog
        const dialog = document.getElementById('lineDialog');
        if (dialog) {
          dialog.open();
        }
        
      } catch (error) {
        console.error("Error opening line dialog:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to open line dialog: ' + error.message,
          type: 'error',
          displayMode: 'persist'
        });
      }
    }
  }

  return onOpenLineDialog;
});