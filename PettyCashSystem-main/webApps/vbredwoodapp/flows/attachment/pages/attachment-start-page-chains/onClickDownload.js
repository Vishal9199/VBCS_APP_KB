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

  class onClickDownload extends ActionChain {

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

      const response = await Actions.callRest(context, {
        endpoint: 'ORDS/postNws_custAttachmentDownload',
        headers: {
          'X-cache-documentid': $application.functions.encryptJs_Normal($application.constants.secretKey, key),
        },
      });

      if (response.body.P_STATUS === 'S') {
        await $application.functions.downloadFile(response.body.P_OUTPUT[0].document_file, response.body.P_OUTPUT[0].document_name, response.body.P_OUTPUT[0].document_type);
      }
    }
  }

  return onClickDownload;
});