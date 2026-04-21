// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (
//   ActionChain,
//   Actions,
//   ActionUtils
// ) => {
//   'use strict';

//   class onOpenAttchmentDialog extends ActionChain {

//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {object} params.event
//      * @param {any} params.originalEvent
//      * @param {any} params.key
//      * @param {number} params.index
//      * @param {any} params.current
//      */
//     async run(context, { event, originalEvent, key, index, current }) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       const attachmentPopupOpen = await Actions.callComponentMethod(context, {
//         selector: '#attachmentPopup',
//         method: 'open',
//       });
//     }
//   }

//   return onOpenAttchmentDialog;
// });

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

  class onViewAttachmentsPopup_AC extends ActionChain {

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

      let enc_applCode = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.P_APPLICATION_CODE,
        },
      });

      let enc_trxId = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.projectCharterId,
        },
      });

      let enc_attachmentCategory = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: current.row.lookup_value_code,
        },
      });

      // const response = await Actions.callRest(context, {
      //   endpoint: 'PAM/postAttachmentSearch',
      //   headers: {
      //     'X-cache-applicationcode': enc_applCode,
      //     'X-cache-type': enc_attachmentCategory,
      //   },
      // });

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/postPmispddProjectdocumentAttachmentSearch',
        headers: {
          'X-cache-applicationcode': enc_applCode,
          'X-document-category': enc_attachmentCategory,
          'X-cache-transactionid': enc_trxId,
        },
      });


      $variables.attachmentPopupADP.data = response.body.P_OUTPUT;

      document.getElementById('attachmentPopup').open();
    }
  }

  return onViewAttachmentsPopup_AC;
});