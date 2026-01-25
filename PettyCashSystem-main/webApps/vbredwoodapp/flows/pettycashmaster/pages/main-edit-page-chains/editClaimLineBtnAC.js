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

  class editClaimLineBtnAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let temp_key;
      let temp_claim_header_key;
      let temp_doc_category;
      let temp_reference_key;

      const claimCreateDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#claimCreateDialog',
        method: 'open',
      });

      $variables.claimLineForm = current.row;
      $variables.claimLineForm.amount_in_omr = $variables.claimLineForm.amount * $variables.claimLineForm.exchange_rate;

      // temp_key = await $application.functions.encryptJs_Normal($application.constants.secretKey, key);
      temp_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: key,
        },
      });
      
      // temp_claim_header_key = await $application.functions.encryptJs_Normal($application.constants.secretKey, current.row.claim_header_id);
      temp_claim_header_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: current.row.claim_header_id,
        },
      });

      // temp_doc_category = await $application.functions.encryptJs_Normal($application.constants.secretKey, 'PC_CLAIM_LINE');
      temp_doc_category = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'PC_CLAIM_LINE',
        },
      });

      console.log("++1 Line ID/Reference ID: ", temp_key);
      console.log("++1 TRANSACTION ID: ", temp_claim_header_key);
      console.log("++1 DOCUMENT CATEGORY: ", temp_doc_category);

      const response = await Actions.callRest(context, {
        endpoint: 'ORDS/postNws_custAttachmentSearch',
        headers: {
          'X-cache-applicationcode': $constants.stored_Appl_Code,
          'X-cache-transactionid': temp_claim_header_key,
          'X-document-category': temp_doc_category,
          'X-referenceid': temp_key,
        },
      });

      console.log("++++++++++++++@@@@@@@@@@@@@@@@@@@123: ", JSON.stringify(response.body));

      if ((response.body.P_OUTPUT.length === 1)) {

        $variables.line_Attachments_Obj.attachment_claim_Line = response.body.P_OUTPUT[0].document_name;
        $variables.line_Attachments_Obj.attachment_claim_Line_Doc_Id = response.body.P_OUTPUT[0].document_id;

        $variables.attachmentObj.P_DOCUMENT_NAME = $variables.line_Attachments_Obj.attachment_claim_Line;

        $variables.attachmentObj.P_DOCUMENT_CATEGORY = response.body.P_OUTPUT[0].document_category;
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'Error while fetching attachment',
          displayMode: 'transient',
          type: 'warning',
        });
      }
    }
  }

  return editClaimLineBtnAC;
});
