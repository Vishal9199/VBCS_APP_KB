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
      const { $page, $variables } = context;

      // ✅ Store the row key separately in its own variable
      $page.variables.rowToEdit = { rowKey: key };

      // Only encrypt if it's an existing DB row (key > 0)
      if (key && key > 0) {
        const enc_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: key },
        });

        const enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: current.row },
        });

        $page.variables.passKey = enc_key;
        $page.variables.passPayload = enc_payload;
      }

      await Actions.callComponentMethod(context, {
        selector: '#delete_dialog',
        method: 'open',
      });
    }
  }

  return onDeleteAction;
});