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

  class onloadAttachmentAC extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        if ($variables.pNavCode === 'CREATE' || !$variables.pNavId || $variables.pNavId === '0') {
          console.log('[onloadAttachmentAC] Skipping - CREATE mode or no pNavId');
          return;
        }

        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postAttachmentSearch',
          headers: {
            'X-cache-applicationcode': $variables.P_APPLICATION_CODE,
            'X-cache-transactionid':   $variables.pNavId,
          },
        });

        console.log('[onloadAttachmentAC] Response:', JSON.stringify(response.body));

        if (response.body?.P_OUTPUT && response.body.P_OUTPUT.length > 0) {
          // Store full array in attachmentList for table display
          // $variables.attachmentList = response.body.P_OUTPUT;
          // Store first record in attachmentObj for form fields
          $variables.attachmentObj.P_DOCUMENT_NAME     = response.body.P_OUTPUT[0].document_name;
          $variables.attachmentObj.P_DESCRIPTION       = response.body.P_OUTPUT[0].description;
          $variables.attachmentObj.P_DOCUMENT_TYPE     = response.body.P_OUTPUT[0].document_type;
          $variables.attachmentObj.P_DOCUMENT_CATEGORY = response.body.P_OUTPUT[0].document_category;
          $variables.attachmentObj.P_TITLE             = response.body.P_OUTPUT[0].title;
          $variables.attachmentObj.P_TYPE              = response.body.P_OUTPUT[0].type;
          $variables.attachmentObj.P_URL               = response.body.P_OUTPUT[0].url;

          // console.log('[onloadAttachmentAC] attachmentList count:', $variables.attachmentList.length);
          console.log('[onloadAttachmentAC] attachmentObj:', JSON.stringify($variables.attachmentObj));
        } else {
          // $variables.attachmentList = [];
          console.log('[onloadAttachmentAC] No attachments found for pNavId:', $variables.pNavId);
        }

      } catch (error) {
        console.error('[onloadAttachmentAC] Error:', error.message);
      }
    }
  }

  return onloadAttachmentAC;
});