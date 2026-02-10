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

  class onDeleteLine extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let enc_method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'DELETE',
        },
      });

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

      const deleteDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'setProperty',
        params: [
          'enc_method',
          enc_method
        ],
        'enc_method': enc_method,
      });

      const deleteDialogSetProperty2 = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'setProperty',
        params: [
          'enc_key',
          enc_key,
        ],
        'enc_method': enc_method,
      });

      const deleteDialogSetProperty3 = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'setProperty',
        params: [
          'enc_payload',
          enc_payload,
        ],
        'enc_method': enc_method,
      });

      const deleteDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'open',
      });
    }
  }

  return onDeleteLine;
});
