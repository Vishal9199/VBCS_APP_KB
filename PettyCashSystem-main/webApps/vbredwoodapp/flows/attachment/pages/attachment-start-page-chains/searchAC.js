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

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const response = await Actions.callRest(context, {
        endpoint: 'ORDS/postNws_custAttachmentSearch',
        headers: {
          'X-cache-applicationcode': $variables.P_APPLICATION_CODE,
          'X-cache-transactionid':  $variables.P_TRANSACTION_ID,
        },
      });

      if (!response.ok) {
        if (true) {
        }
      
        return;
      } else {
        const results = await Promise.all([
          async () => {

            const splitArrayByFile = await $functions.splitArrayByType(response.body.P_OUTPUT, 'FILE');

            $variables.adpAttachmentFile.data = splitArrayByFile;
          },
          async () => {

            const splitArrayByText = await $functions.splitArrayByType(response.body.P_OUTPUT, 'TEXT');

            $variables.adpAttachmentText.data = splitArrayByText;
          },
          async () => {
             const splitArrayByUrl = await $functions.splitArrayByType(response.body.P_OUTPUT, 'URL');

            $variables.adpAttachmentUrl.data = splitArrayByUrl;
          },
        ].map(sequence => sequence()));
      }
    }
  }

  return searchAC;
});