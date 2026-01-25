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

  class saveDocumentsAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $variables } = context;

      try {
        for (const item of $variables.filesArray) {

          // Map file data to attachmentObj
          $variables.attachmentObj.P_DOCUMENT_FILE = item.document_file;
          $variables.attachmentObj.P_DOCUMENT_NAME = item.document_name;
          $variables.attachmentObj.P_DOCUMENT_TYPE = item.document_type;

          // Encrypt required fields
          const [
            encryptedCreatedBy,
            encryptedDescription,
            encryptedDocType,
            encryptedName,
            encryptedTitle,
            encryptedType,
            encryptedUrl,
            encryptedTransactionId,
            encryptedApplCode,
            encryptedCategory
          ] = await Promise.all([
            Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: $variables.attachmentObj.P_CREATED_BY },
            }),
            Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: $variables.attachmentObj.P_DESCRIPTION },
            }),
            Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: $variables.attachmentObj.P_DOCUMENT_TYPE },
            }),
            Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: $variables.attachmentObj.P_DOCUMENT_NAME },
            }),
            Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: $variables.attachmentObj.P_TITLE },
            }),
            Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: $variables.attachmentObj.P_TYPE },
            }),
            Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: $variables.attachmentObj.P_URL },
            }),
            Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: $variables.attachmentObj.P_TRANSACTION_ID },
            }),
            Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: $variables.attachmentObj.P_APPL_CODE },
            }),
            Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: $variables.attachmentObj.P_DOCUMENT_CATEGORY },
            }),
          ]);

          console.log('Uploading attachment:', JSON.stringify($variables.attachmentObj, null, 2));

          // REST call per file
          const response = await Actions.callRest(context, {
            endpoint: 'ORDS/postAttachmentProcess',
            body: $variables.attachmentObj.P_DOCUMENT_FILE,
            headers: {
              'X-cache-applcode': encryptedApplCode,
              'X-cache-category': encryptedCategory,
              'X-cache-createdby': encryptedCreatedBy,
              'X-cache-description': encryptedDescription,
              'X-cache-doctype': encryptedDocType,
              'X-cache-name': encryptedName,
              'X-cache-title': encryptedTitle,
              'X-cache-transactionid': encryptedTransactionId,
              'X-cache-type': encryptedType,
              'X-cache-url': encryptedUrl,
            },
          });

          if (response?.body?.P_STATUS !== 'S') {
            throw new Error(`Attachment save failed for ${item.document_name}`);
          }

          // Reset attachment object after each file
          await Actions.resetVariables(context, {
            variables: ['$variables.attachmentObj'],
          });
        }

      } catch (error) {
        console.error(error);
        throw new Error('Attachment save failed');
      }
    }

  }

  return saveDocumentsAC;
});
