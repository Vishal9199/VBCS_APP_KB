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

  class onClickSave extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.formObj.addDialogValidate === 'valid') {
        
        // Check if type is FILE but document file is null/empty
        if ($variables.attachmentObj.P_TYPE === 'FILE' && 
            ($variables.attachmentObj.P_DOCUMENT_FILE === '' || 
             $variables.attachmentObj.P_DOCUMENT_FILE === 'NULL' || 
             $variables.attachmentObj.P_DOCUMENT_FILE === null || 
             $variables.attachmentObj.P_DOCUMENT_FILE === undefined)) {
          
          // Show error message when type is FILE but document is missing
          await Actions.fireNotificationEvent(context, {
            summary: 'File Required',
            message: 'Please select a document file when type is File',
            type: 'error',
            displayMode: 'transient'
          });
          
        } else {
          const response = await Actions.callRest(context, {
            endpoint: 'ORDS/postNws_custAttachmentProcess',
            headers: {
              'X-cache-applcode': $variables.attachmentObj.P_APPL_CODE,
              'X-cache-category': $application.functions.encryptJs($application.constants.secretKey, $variables.attachmentObj.P_DOCUMENT_CATEGORY),
              'X-cache-createdby': $application.functions.encryptJs($application.constants.secretKey, $application.user.email),
              'X-cache-description': $application.functions.encryptJs($application.constants.secretKey, $variables.attachmentObj.P_DESCRIPTION),
              'X-cache-doctype': $application.functions.encryptJs($application.constants.secretKey, $variables.attachmentObj.P_DOCUMENT_TYPE),
              'X-cache-name': $application.functions.encryptJs($application.constants.secretKey, ($variables.attachmentObj.P_DOCUMENT_NAME||$variables.attachmentObj.P_TYPE)),
              'X-cache-title': $application.functions.encryptJs($application.constants.secretKey, $variables.attachmentObj.P_TITLE),
              'X-cache-transactionid': $variables.attachmentObj.P_TRANSACTION_ID,
              'X-cache-type': $application.functions.encryptJs($application.constants.secretKey, $variables.attachmentObj.P_TYPE),
              'X-cache-url': $application.functions.encryptJs($application.constants.secretKey, $variables.attachmentObj.P_URL),
            },
            body: $variables.attachmentObj.P_DOCUMENT_FILE,
          });

          if (response.body.P_STATUS === 'S') {

            // Success message
            await Actions.fireNotificationEvent(context, {
              summary: 'Success',
              message: 'Attachment saved successfully',
              type: 'confirmation',
              displayMode: 'transient'
            });

            const attachmentDialogClose = await Actions.callComponentMethod(context, {
              selector: '#attachmentDialog',
              method: 'close',
            });

            await Actions.resetVariables(context, {
              variables: [
    '$variables.attachmentObj',
  ],
            });

            await Actions.callChain(context, {
              chain: 'searchAC',
            });
          } else {
            await Actions.fireNotificationEvent(context, {
              summary: 'Error in Save Record. Please contact administrator',
            });
          }
        }
        
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Error',
          message: 'Please fill all required fields',
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return onClickSave;
});