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

  class onDeleteAction extends ActionChain {

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

      $variables.isCostOrRisk = 'Cost';

      let enc_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: key,
        },
      });

      let enc_payload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: current.row,
        },
      });

      $variables.passKey = enc_key;
      $variables.passPayload = enc_payload;

      const deleteDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#delete_dialog',
        method: 'open',
      });
    }
  }

  return onDeleteAction;
});