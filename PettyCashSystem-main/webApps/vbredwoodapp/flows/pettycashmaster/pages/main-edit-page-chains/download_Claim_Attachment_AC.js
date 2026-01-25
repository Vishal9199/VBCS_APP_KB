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

  class download_Claim_Attachment_AC extends ActionChain {

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

      try {

        console.log("doc key ++++++++123: ", key);
        
        console.log("doc hdr id ++++++++123: ", $variables.payload.claim_header_id);

        if (key !== null && $variables.payload.claim_header_id != null) {
          
          // let temp_key = $application.functions.encryptJs_Normal($application.constants.secretKey, key);
          let temp_key = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: key,
            },
          });

          console.log("temp_key +++++++++++123: ", temp_key);

          // let temp_hdr_id = $application.functions.encryptJs_Normal($application.constants.secretKey, $variables.payload.claim_header_id);

          let temp_hdr_id = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.payload.claim_header_id,
            },
          });

          console.log("temp_hdr_id +++++++++++123: ", temp_hdr_id);

          await Actions.callChain(context, {
            chain: 'download_Attachment_AC',
            params: {
              'input_current_line_key': temp_key,
              'input_hdr_key': temp_hdr_id,
            },
          });
        }
      } catch (error) {
      } finally {
      }
    }
  }

  return download_Claim_Attachment_AC;
});
