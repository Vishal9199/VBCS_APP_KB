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

  class onDeleteAttachment_AC extends ActionChain {

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

      let enc_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: current.row.document_id,
        },
      });

      let enc_trx_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: current.row.transaction_id,
        },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'OICBucket/deleteDelete',
        uriParams: {
          location: enc_key,
        },
      });

      const response2 = await Actions.callRest(context, {
        endpoint: 'PAM/postAttachmentDelete',
        headers: {
          'x-cache-doc-id': enc_key,
          'x-cache-trans-id': enc_trx_id,
        },
      });

    }
  }

  return onDeleteAttachment_AC;
});