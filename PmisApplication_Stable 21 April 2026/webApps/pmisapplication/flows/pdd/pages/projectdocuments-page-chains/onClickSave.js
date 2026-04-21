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
      const { $page, $flow, $application, $constants, $variables,$functions } = context;

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
          const loadingDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'open',
          });

          let enc_applCode = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_APPL_CODE,
            },
          });
          let enc_cacheDescription = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_DESCRIPTION,
            },
          });
          let enc_docCategory = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_DOCUMENT_CATEGORY,
            },
          });
          let enc_createdBy = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_CREATED_BY,
            },
          });
          let enc_docName = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_DOCUMENT_NAME,
            },
          });
          let enc_cacheDocType = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_DOCUMENT_TYPE,
            },
          });
          let enc_cacheTitle = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_TITLE,
            },
          });
          let enc_cacheId = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_TRANSACTION_ID,
            },
          });
          let enc_cacheType = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_TYPE,
            },
          });
          let enc_cacheUrl = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.attachmentObj.P_URL,
            },
          });

          // let pass_pc_type = await Actions.callChain(context, {
          //   chain: 'application:encryptAC',
          //   params: {
          //     input: $variables.selectedPcAttachment,
          //   },
          // });

          // $variables.attachmentObj.P_REFERENCE_TYPE = pass_pc_type;
          

          // ---- TODO: Add your code here ---- //
          
          console.log("++++++++++++1: ", JSON.stringify($variables.attachmentObj));

          // return;

          const response = await Actions.callRest(context, {
            endpoint: 'PAM/postAttachmentProcess',
            headers: {
              'X-cache-category': enc_docCategory,
              'X-cache-createdby': enc_createdBy,
              'X-cache-description': enc_cacheDescription,
              'X-cache-doctype': enc_cacheDocType,
              'X-cache-name': enc_docName,
              'X-cache-title': enc_cacheTitle,
              'X-cache-type': enc_cacheType,
              'X-cache-url': enc_cacheUrl,
              'X-cache-applcode': $variables.P_APPLICATION_CODE,
              'X-cache-transactionid': $variables.P_TRANSACTION_ID,
            },
            body: 'null',
          });

          if (response.body.P_STATUS === 'S') {

            let bucketlocation =  await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: response.body.P_PRIMARYKEY,
              },
            });

            const file = await $functions.convertFileToBase64($variables.attachmentObj.P_DOCUMENT_FILE, undefined);

            $variables.oicbucket.data.file = file;
            $variables.oicbucket.data.location = bucketlocation;

            const response2 = await Actions.callRest(context, {
              endpoint: 'OICBucket/postUpload',
              body: $variables.oicbucket,
            });

            // Success message
            await Actions.fireNotificationEvent(context, {
              summary: 'Success',
              message: 'Attachment saved successfully',
              type: 'confirmation',
              displayMode: 'transient'
            });

            await Actions.callChain(context, {
              chain: 'loadDocumentColumns_AC',
            });

            const attachmentDialogClose = await Actions.callComponentMethod(context, {
              selector: '#attachmentDialog',
              method: 'close',
            });

            const loadingDialogClose = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });

            await Actions.resetVariables(context, {
              variables: [
                '$variables.attachmentObj',
                '$variables.adpAttachmentFile',
                '$variables.adpAttachmentText',
                '$variables.adpAttachmentUrl',
              ],
            });

            // await Actions.callChain(context, {
            //   chain: 'searchAC',
            // });
            
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