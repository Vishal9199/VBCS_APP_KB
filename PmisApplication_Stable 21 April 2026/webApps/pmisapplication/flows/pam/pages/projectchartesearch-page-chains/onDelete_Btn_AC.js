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

  class onDelete_Btn_AC extends ActionChain {

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
          input: key,
        },
      });

      let enc_method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'DELETE',
        },
      });

      let enc_payload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: current.row,
        },
      });

      $variables.passDtls.enc_id = enc_key;
      $variables.passDtls.enc_method = enc_method;
      $variables.passDtls.enc_payload = enc_payload;

      const deleteDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#delete_dialog',
        method: 'open',
      });
    }
  }

  return onDelete_Btn_AC;
});
