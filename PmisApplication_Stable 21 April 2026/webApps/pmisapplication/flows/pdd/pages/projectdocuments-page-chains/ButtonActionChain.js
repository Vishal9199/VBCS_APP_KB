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

  class ButtonActionChain extends ActionChain {

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

      let enc_doc_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: current.row.document_id,
        },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'OICBucket/getObject',
        uriParams: {
          location: enc_doc_id,
        },
      });

      await $application.functions.downloadFile(response.body.data, current.row.document_name, current.row.document_type);

    }
  }

  return ButtonActionChain;
});
