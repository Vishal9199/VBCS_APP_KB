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

  class onDeleteOk extends ActionChain {

        /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const loadingDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#loadingDialog',
        method: 'open',
      });

      let enc_cacheId = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.rowid,
        },
      });
      
      const response = await Actions.callRest(context, {
        endpoint: 'PAM/postAttachmentDelete',
        headers: {
          'x-cache-doc-id': enc_cacheId,
        },
      });

      const response2 = await Actions.callRest(context, {
        endpoint: 'OICBucket/deleteDelete',
        uriParams: {
          location: enc_cacheId,
        },
      });

      if (!response.ok) {
        if (true) {

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        }
      
        return;
      } else {
        const deleteDialogClose = await Actions.callComponentMethod(context, {
          selector: '#deleteDialog',
          method: 'close',
        });

        await Actions.resetVariables(context, {
          variables: [
            '$variables.adpAttachmentFile',
            '$variables.adpAttachmentText',
            '$variables.adpAttachmentUrl',
          ],
        });

        await Actions.callChain(context, {
          chain: 'loadDocumentColumns_AC',
        });

        const attachmentPopupClose = await Actions.callComponentMethod(context, {
          selector: '#attachmentPopup',
          method: 'close',
        });

        const loadingDialogClose3 = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });
      }
    }
  }

  return onDeleteOk;
});