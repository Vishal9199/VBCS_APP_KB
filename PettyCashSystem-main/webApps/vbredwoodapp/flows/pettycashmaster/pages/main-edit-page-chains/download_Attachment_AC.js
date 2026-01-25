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

  class download_Attachment_AC extends ActionChain {

    /**
     * For both claim line and receipt line.
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.input_hdr_key Input parameter for header key
     * @param {string} params.input_current_line_key Input parameter for current line record
     */
    async run(context, { input_hdr_key, input_current_line_key }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {


        const response2 = await Actions.callRest(context, {
          endpoint: 'ORDS/postNws_custAttachmentSearch',
          headers: {
            'X-cache-transactionid': input_hdr_key,
            'X-cache-applicationcode': $variables.attachmentObj.P_APPL_CODE,
          },
        });

        // let temp_hdr_key = await $application.functions.encryptJs_Normal($application.constants.secretKey, input_hdr_key);

        // const enc_hdr_key = temp_hdr_key;

        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postNws_custAttachmentDownload',
          headers: {
            'X-cache-transactionid': input_hdr_key,
            'X-cache-referenceid': input_current_line_key,
          },
        });

        if (response.body.P_STATUS === 'S') {
           await $application.functions.downloadFile(response.body.P_OUTPUT[0].document_file, response.body.P_OUTPUT[0].document_name, response.body.P_OUTPUT[0].document_type);
        
        } else {
                
           return;
        }
      } catch (error) {
      } finally {
      }
    }
  }

  return download_Attachment_AC;
});
