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

  class onDelete extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Store row key and index for confirmation
      $variables.deleteRowKey = key;
      $variables.deleteRowIndex = index;

      let enc_payload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: current.row,
        },
      });

      $variables.tempPayload = enc_payload;

      const deleteDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'open',
      });

      console.log("onDelete - Row key:", key, "Index:", index);
    }
  }

  return onDelete;
});