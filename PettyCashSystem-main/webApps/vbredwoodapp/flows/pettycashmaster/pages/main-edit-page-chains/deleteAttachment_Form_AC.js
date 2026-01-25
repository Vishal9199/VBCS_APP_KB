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

  class deleteAttachment_Form_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let temp_doc_id;

      if ($variables.attachmentObj.P_DOCUMENT_CATEGORY === 'PC_CLAIM_LINE' && $variables.attachmentObj.P_DOCUMENT_NAME != null) {

        // temp_doc_id = await $application.functions.encryptJs_Normal($application.constants.secretKey, $variables.line_Attachments_Obj.attachment_claim_Line_Doc_Id);
        temp_doc_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.line_Attachments_Obj.attachment_claim_Line_Doc_Id,
          },
        });
      } else if ($variables.attachmentObj.P_DOCUMENT_CATEGORY === 'PC_RECEIPT_LINE' && $variables.attachmentObj.P_DOCUMENT_NAME != null) {

        // temp_doc_id = await $application.functions.encryptJs_Normal($application.constants.secretKey, $variables.line_Attachments_Obj.attachment_receipt_line_Doc_Id);
        temp_doc_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.line_Attachments_Obj.attachment_receipt_line_Doc_Id,
          },
        });
      } else {
        // await Actions.fireNotificationEvent(context, {
        //   summary: 'Attachment not found',
        //   displayMode: 'transient',
        //   type: 'error',
        // });
      }

      const response = await Actions.callRest(context, {
        endpoint: 'ORDS/postNws_custAttachmentDelete',
        headers: {
          'x-cache-doc-id': temp_doc_id,
        },
      });

      if (response.body.P_ERR_CODE === 'S') {
        await Actions.resetVariables(context, {
          variables: [
    '$variables.attachmentObj',
  ],
        });
      }

      await Actions.resetVariables(context, {
        variables: [
          '$variables.attachmentObj',
        ],
      });
    }
  }

  return deleteAttachment_Form_AC;
});