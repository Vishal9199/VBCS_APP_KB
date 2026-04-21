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

  class onDelete_Dependency_Dialog extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {any} params.current
     * @param {number} params.index
     */
    async run(context, { event, originalEvent, key, current, index }) {
      const { $variables } = context;

      $variables.isCostOrRisk = 'Dependency';

      const enc_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: key },
      });

      const enc_payload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: current.row },
      });

      $variables.passKey     = enc_key;
      $variables.passPayload = enc_payload;

      console.log('🗑️ onDelete_Dependency_Dialog: dependency_id =', key);

      await Actions.callComponentMethod(context, {
        selector: '#delete_dialog',
        method: 'open',
      });
    }
  }

  return onDelete_Dependency_Dialog;
});