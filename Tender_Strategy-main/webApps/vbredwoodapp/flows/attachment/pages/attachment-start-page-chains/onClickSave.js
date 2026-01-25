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
          // 🔐 Prepare encrypted header values (TEMP VARIABLES)

          const encCategory = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_DOCUMENT_CATEGORY
            },
          });
          

          const encCreatedBy = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $application.user.email,
            },
          });

          const encDescription = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_DESCRIPTION
            },
          });

          const encDocType = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_DOCUMENT_TYPE
            },
          });

          const encCacheType = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_TYPE
            },
          });

          const encDocName = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_DOCUMENT_NAME
            },
          });

          const encTitle = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_TITLE
            },
          });

          const encUrl = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_URL
            },
          });

          const encNull = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: '0'
            },
          });

          // const response = await Actions.callRest(context, {
          //   endpoint: 'ORDS/postAttachmentProcess',
          //   headers: {
          //     'X-cache-applcode': $variables.P_APPLICATION_CODE,
          //     'X-cache-category': $application.functions.encryptJs($variables.attachmentObj.P_DOCUMENT_CATEGORY, $application.constants.secretKey, $application.constants.time, $application.constants.unit),
          //     'X-cache-createdby': $application.functions.encryptJs($application.user.email, $application.constants.secretKey, $application.constants.time, $application.constants.unit),
          //     'X-cache-description': $application.functions.encryptJs($variables.attachmentObj.P_DESCRIPTION, $application.constants.secretKey, $application.constants.time, $application.constants.unit),
          //     'X-cache-doctype': $application.functions.encryptJs($variables.attachmentObj.P_DOCUMENT_TYPE, $application.constants.secretKey, $application.constants.time, $application.constants.unit),
          //     'X-cache-name': $application.functions.encryptJs($variables.attachmentObj.P_DOCUMENT_NAME, $application.constants.secretKey, $application.constants.time, $application.constants.unit),
          //     'X-cache-title': $application.functions.encryptJs($variables.attachmentObj.P_TITLE, $application.constants.secretKey, $application.constants.time, $application.constants.unit),
          //     'X-cache-transactionid': $variables.P_TRANSACTION_ID,
          //     'X-cache-type': $application.functions.encryptJs($variables.attachmentObj.P_DOCUMENT_TYPE, $application.constants.secretKey, $application.constants.time, $application.constants.unit),
          //     'X-cache-url': $application.functions.encryptJs($variables.attachmentObj.URL, $application.constants.secretKey, $application.constants.time, $application.constants.unit)
          //   },
          //   body: $variables.attachmentObj.P_DOCUMENT_FILE,
          // });

          const response = await Actions.callRest(context, {
            endpoint: 'ORDS/postAttachmentProcess',
            headers: {
              'X-cache-applcode': $variables.P_APPLICATION_CODE,
              'X-cache-category': encCategory,
              'X-cache-createdby': encCreatedBy,
              'X-cache-description': encDescription,
              'X-cache-doctype': encDocType,
              'X-cache-name': encDocName,
              'X-cache-title': encTitle,
              'X-cache-transactionid': $variables.P_TRANSACTION_ID,
              'X-cache-type': encCacheType,
              'X-cache-url': encUrl,
              'X-cache-referenceid': encNull,
              'X-cache-referencetype': encNull,
            },
            body: $variables.attachmentObj.P_DOCUMENT_FILE,
          });

          if (response.body.P_STATUS === 'S') {

            // Success message
            await Actions.fireNotificationEvent(context, {
              summary: response.body.P_ERR_MSG,
              message: 'Attachment saved successfully',
              type: 'confirmation',
              displayMode: 'transient',
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