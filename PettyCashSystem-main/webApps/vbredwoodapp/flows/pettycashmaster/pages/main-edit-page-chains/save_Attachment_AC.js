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

  class save_Attachment_AC extends ActionChain {

    /**
     * Save attachment to database using encryptJs_Normal
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.input_hdr_param
     * @param {string} params.input_reference_id Input parameter for reference id of the attachment
     * @param {string} params.attach_Type
     */
    async run(context, { input_hdr_param, input_reference_id, attach_Type }) {
      const { $page, $application, $variables, $functions } = context;

      try {
        // Show progress dialog
        await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'open'
        });

        // Validate required fields before encryption
        const attachmentObj = $variables.attachmentObj;
        console.log("+++++++11111111 Before Encryption in API: ", attachmentObj.P_DOCUMENT_TYPE);
        console.log("+++++++11111111 Before Encryption in API: ", attachmentObj.P_DESCRIPTION);

        // Check if file is selected
        if (!attachmentObj.P_DOCUMENT_FILE) {
          console.log('ℹ️ No file selected, skipping attachment upload');
          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close'
          });
          return;
        }

        // Check if transaction ID is set (should be set by save_ClaimLine_AC)
        if (!attachmentObj.P_TRANSACTION_ID) {
          throw new Error('Transaction ID not set. Line must be saved first.');
        }

        console.log('📤 Starting attachment upload...');
        console.log('📎 Attachment details:', {
          has_file: !!attachmentObj.P_DOCUMENT_FILE,
          file_name: attachmentObj.P_DOCUMENT_NAME,
          file_type: attachmentObj.P_DOCUMENT_TYPE,
          file_size: attachmentObj.P_DOCUMENT_FILE.size,
          transaction_id: attachmentObj.P_TRANSACTION_ID,
          created_by: attachmentObj.P_CREATED_BY
        });

        // Get encryption key from application or use default
        const encryptionKey = $application.constants.secretKey;

        // Helper function to prepare values for encryption
        const prepareValue = (value) => {
          if (value === null || value === undefined) {
            return '';
          }
          return String(value);
        };

        // Encrypt all parameters using encryptJs_Normal with key and payload
        console.log('🔐 Encrypting parameters using encryptAC...');

        // $variables.attachmentObj.P_TRANSACTION_ID = $application.functions.encryptJs_Normal($application.constants.secretKey, input_hdr_param);

        $variables.attachmentObj.P_TRANSACTION_ID = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: input_hdr_param,
          },
        });
        

        // const enc_document_name = $application.functions.encryptJs_Normal(encryptionKey, attachmentObj.P_DOCUMENT_NAME);
        let enc_document_name = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: attachmentObj.P_DOCUMENT_NAME,
          },
        });
        console.log('✅ Encrypted P_DOCUMENT_NAME: ', enc_document_name);

        // const enc_created_by = $application.functions.encryptJs_Normal(encryptionKey, attachmentObj.P_CREATED_BY);
        const enc_created_by = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: attachmentObj.P_CREATED_BY,
          },
        });
        console.log('✅ Encrypted P_CREATED_BY');

        // const enc_description = $application.functions.encryptJs_Normal(encryptionKey, attachmentObj.P_DESCRIPTION);
        const enc_description = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: attachmentObj.P_DESCRIPTION,
          },
        });
        console.log('✅ Encrypted P_DESCRIPTION');

        // const enc_document_type = $application.functions.encryptJs_Normal(encryptionKey, attachmentObj.P_DOCUMENT_TYPE);
        const enc_document_type = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: attachmentObj.P_DOCUMENT_TYPE,
          },
        });
        // if (undefined) {
        //   console.log('✅ Encrypted P_DOCUMENT_TYPE');
  
        //   // const enc_document_category = $application.functions.encryptJs_Normal(encryptionKey, $variables.docTypeVar);
        // }
        const enc_document_category = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: attach_Type,
          },
        });
        console.log('✅ Encrypted P_DOCUMENT_CATEGORY', $variables.docTypeVar);

        // const enc_appl_code = $application.functions.encryptJs_Normal(
        //   encryptionKey,
        //   prepareValue(attachmentObj.P_APPL_CODE)
        // );
        // window.alert();
        const enc_appl_code = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: attachmentObj.P_APPL_CODE,
          },
        });
        console.log('✅ Encrypted P_APPL_CODE');

        // const enc_type = $application.functions.encryptJs_Normal(encryptionKey, $variables.attachmentObj.P_TYPE);
        const enc_type = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.attachmentObj.P_TYPE,
          },
        });
        console.log('✅ Encrypted P_TYPE');

        // const enc_title = $application.functions.encryptJs_Normal(encryptionKey, attachmentObj.P_TITLE);
        const enc_title = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: attachmentObj.P_TITLE,
          },
        });
        console.log('✅ Encrypted P_TITLE');

        // const enc_transaction_id = $application.functions.encryptJs_Normal(
        //   encryptionKey,
        //   prepareValue(attachmentObj.P_TRANSACTION_ID)
        // );
        console.log('✅ Encrypted P_TRANSACTION_ID');

        // const enc_ref_id = await $application.functions.encryptJs_Normal(encryptionKey, input_reference_id);
        const enc_ref_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: input_reference_id,
          },
        });

        // Encrypt empty string for null values
        // const enc_null = $application.functions.encryptJs_Normal(encryptionKey, '');
        const enc_null = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: attach_Type,
          },
        });
        console.log('✅ Encrypted null value');

        console.log('✅ All encryption completed successfully');
        console.log('🔑 Encrypted transaction ID:', $variables.attachmentObj.P_TRANSACTION_ID);

        // Prepare request headers with all encrypted values
        const requestHeaders = {
          'P_DOCUMENT_NAME': enc_document_name,
          'P_CREATED_BY': enc_created_by,
          'P_DESCRIPTION': enc_description,
          'P_DOCUMENT_CATEGORY': enc_document_category,
          'P_DOCUMENT_TYPE': enc_document_type,
          'P_APPL_CODE': enc_appl_code,
          'P_TYPE': enc_type,
          // 'P_TRANSACTION_ID': enc_transaction_id,
          'P_TITLE': enc_title,
          'P_URL': enc_null,                    // Encrypted empty for null
          'P_REFERENCE_TYPE': enc_null,         // Encrypted empty for null
          'P_REFERENCE_ID': enc_ref_id
        };

        console.log('📋 Request headers prepared (encrypted values)');

        // Call attachment upload API
        // console.log("Header PK: ", requestHeaders.P_TRANSACTION_ID);
        console.log('🌐 Calling attachment upload API...');

        console.log("save_Attachment_AC requestHeaders.DOCUMENT", requestHeaders.P_DOCUMENT_CATEGORY + ' ## ' + requestHeaders.P_DESCRIPTION);
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postNws_custAttachmentProcess',
          body: $page.variables.attachmentObj.P_DOCUMENT_FILE,
          headers: {
            'X-cache-name': requestHeaders.P_DOCUMENT_NAME,
            'X-cache-applcode': requestHeaders.P_APPL_CODE,
            'X-cache-createdby': requestHeaders.P_CREATED_BY,
            'X-cache-description': requestHeaders.P_DESCRIPTION,
            'X-cache-transactionid': $variables.attachmentObj.P_TRANSACTION_ID,
            'X-cache-doctype': requestHeaders.P_DOCUMENT_TYPE,
            'X-cache-type': requestHeaders.P_TYPE,
            'X-cache-title': requestHeaders.P_TITLE,
            'X-cache-url': requestHeaders.P_URL,
            'X-cache-referencetype': requestHeaders.P_REFERENCE_TYPE,
            'X-cache-referenceid': requestHeaders.P_REFERENCE_ID,
            'X-cache-category': enc_document_category,
          },
        });

        console.log('📨 API Response received');
        console.log('Response status:', response.status);
        console.log('Response body:', response.body);

        // Close progress dialog
        await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'close'
        });

        // Handle response
        if (response.body && response.body.P_STATUS === 'S') {
          console.log('✅ Attachment uploaded successfully');
          console.log('🆔 Document ID:', response.body.P_PRIMARYKEY);

          // await Actions.fireNotificationEvent(context, {
          //   summary: 'Attachment uploaded successfully',
          //   message: response.body.P_ERR_MSG || 'File uploaded with ID: ' + response.body.P_PRIMARYKEY,
          //   type: 'confirmation',
          //   displayMode: 'transient'
          // });

          // Store document ID for reference
          $variables.lastUploadedDocumentId = response.body.P_PRIMARYKEY;

          // Reset attachment object after successful upload
          await Actions.resetVariables(context, {
            variables: ['$variables.attachmentObj']
          });

        } else {
          // Handle error response
          const errorMsg = response.body?.P_ERR_MSG || 'Attachment upload failed';
          console.error('❌ Upload failed:', errorMsg);
          console.error('Error code:', response.body?.P_ERR_CODE);
          
          throw new Error(errorMsg);
        }

      } catch (error) {
        console.error('❌ Attachment upload error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        // Close progress dialog
        try {
          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close'
          });
        } catch (dialogError) {
          console.error('Error closing progress dialog:', dialogError);
        }

        await Actions.fireNotificationEvent(context, {
          summary: 'Attachment upload failed',
          message: error.message || 'Please check the file and try again',
          type: 'error',
          displayMode: 'persist'
        });
      }
    }
  }

  return save_Attachment_AC;
});