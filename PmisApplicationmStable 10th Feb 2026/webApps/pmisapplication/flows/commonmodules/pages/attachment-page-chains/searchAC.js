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

  class searchAC extends ActionChain {

    async run(context) {
      const { $page, $variables } = context;

      try {
        $variables.formObj.addDialogValidate = 'invalidShown';

        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postAttachmentSearch',
          headers: {
            'X-cache-applicationcode': $variables.P_APPLICATION_CODE,
            'X-cache-transactionid': $variables.P_TRANSACTION_ID,
          },
        });

        if (!response.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Failed to load attachments',
            displayMode: 'transient',
            type: 'error',
          });
          return;
        }

        const allAttachments = response.body.P_OUTPUT || [];
        
        console.log('📊 Total attachments:', allAttachments.length);

        // Split by type
        const splitArrayByFile = allAttachments.filter(item => item.type === 'FILE');
        const splitArrayByText = allAttachments.filter(item => item.type === 'TEXT');
        const splitArrayByUrl = allAttachments.filter(item => item.type === 'URL');

        console.log('📊 Split results:');
        console.log('  FILE:', splitArrayByFile.length);
        console.log('  TEXT:', splitArrayByText.length);
        console.log('  URL:', splitArrayByUrl.length);

        // ✅ Update FILE attachments
        await Actions.fireDataProviderEvent(context, {
          target: $variables.adpAttachmentFile,
          refresh: null
        });

        if (splitArrayByFile.length > 0) {
          await Actions.fireDataProviderEvent(context, {
            target: $variables.adpAttachmentFile,
            add: {
              data: splitArrayByFile,
              keys: new Set(splitArrayByFile.map(item => item.document_id))  // ✅ EXPLICIT KEYS
            }
          });
          console.log('✅ FILE data added');
        }

        // ✅ Update TEXT attachments
        await Actions.fireDataProviderEvent(context, {
          target: $variables.adpAttachmentText,
          refresh: null
        });

        if (splitArrayByText.length > 0) {
          await Actions.fireDataProviderEvent(context, {
            target: $variables.adpAttachmentText,
            add: {
              data: splitArrayByText,
              keys: new Set(splitArrayByText.map(item => item.document_id))  // ✅ EXPLICIT KEYS
            }
          });
          console.log('✅ TEXT data added');
        }

        // ✅ Update URL attachments
        await Actions.fireDataProviderEvent(context, {
          target: $variables.adpAttachmentUrl,
          refresh: null
        });

        if (splitArrayByUrl.length > 0) {
          await Actions.fireDataProviderEvent(context, {
            target: $variables.adpAttachmentUrl,
            add: {
              data: splitArrayByUrl,
              keys: new Set(splitArrayByUrl.map(item => item.document_id))  // ✅ EXPLICIT KEYS
            }
          });
          console.log('✅ URL data added');
        }

        console.log('✅ All ArrayDataProviders updated');

        $variables.formObj.addDialogValidate = 'invalidHidden';

      } catch (error) {
        console.error('❌ Error:', error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Error: ' + error.message,
          displayMode: 'transient',
          type: 'error',
        });

        $variables.formObj.addDialogValidate = 'invalidHidden';
      }
    }
  }

  return searchAC;
});