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

  class saveAttachmentDialogBtnAC extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let encryptedTransactionId = undefined;

      try {
        if ($variables.pNavCode === 'CREATE') {
          $variables.getStatusprogressbyperiodVar.progress_id = $variables.pNavEncId;
          encryptedTransactionId = $variables.pNavEncId;
        } else {
          encryptedTransactionId = $variables.getStatusprogressbyperiodVar.progress_id;
        }

        if (!encryptedTransactionId || encryptedTransactionId === 0) {
          throw new Error('Transaction ID is missing or zero. Cannot save attachment.');
        }

        const docCategory = 'PMIS_STATUSPROGRESS';
        const titleValue  = 'PMIS';
        const typeValue   = 'FILE';   // ← FIXED: was 'PMIS', must be 'FILE'
        const urlValue    = 'PMIS';

        let encryptDoc = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: docCategory },
        });

        let encryptTransId = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: encryptedTransactionId },
        });

        let encryptCreatedBy = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $application.user.email },
        });

        let encryptDesc = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.attachmentObj.P_DESCRIPTION || '' },
        });

        let encryptDocType = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.attachmentObj.P_DOCUMENT_TYPE || '' },
        });

        let encryptTitle = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: titleValue },
        });

        let encryptType = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: typeValue },
        });

        let encryptUrl = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: urlValue },
        });

        let encryptDocName = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.attachmentObj.P_DOCUMENT_NAME || '' },
        });

        if (!$variables.attachmentObj.P_DOCUMENT_FILE) {
          throw new Error('No file selected for upload.');
        }

        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postAttachmentProcess',
          headers: {
            'X-cache-applcode':      $variables.P_APPLICATION_CODE,
            'X-cache-createdby':     encryptCreatedBy,
            'X-cache-url':           encryptUrl,
            'X-cache-title':         encryptTitle,
            'X-cache-transactionid': encryptTransId,
            'X-cache-category':      encryptDoc,
            'X-cache-name':          encryptDocName,
            'X-cache-type':          encryptType,
            'X-cache-description':   encryptDesc,
            'X-cache-doctype':       encryptDocType,
          },
          body: $variables.attachmentObj.P_DOCUMENT_FILE,
        });

        if (response.body?.P_STATUS === 'E') {
          throw new Error(response.body.P_ERR_MSG || 'Attachment save failed.');
        }

        await Actions.fireNotificationEvent(context, {
          summary: 'Attachment saved successfully.',
          displayMode: 'transient',
          type: 'confirmation'
        });

        return response;

      } catch (error) {
        console.error('[ERROR] Error saving attachment:', error.message);

        await Actions.fireNotificationEvent(context, {
          summary: 'Error saving attachment: ' + error.message,
          displayMode: 'persist',
          type: 'error'
        });

        throw error;
      }
    }
  }

  return saveAttachmentDialogBtnAC;
});