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

    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let enc_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: parseInt(key, 10) },
      });

      let enc_payload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: current.data },
      });

      $variables.passKey = enc_key;
      $variables.passPayload = enc_payload;
      $variables.rowToEdit = current.row;       // ✅ use current.row not {}
      $variables.rowToEdit.rowkey = key;        // ✅ key from table click — always correct

      await Actions.callComponentMethod(context, {
        selector: '#delete_dialog',
        method: 'open',
      });
    }
  }

  return onDeleteAction;
});