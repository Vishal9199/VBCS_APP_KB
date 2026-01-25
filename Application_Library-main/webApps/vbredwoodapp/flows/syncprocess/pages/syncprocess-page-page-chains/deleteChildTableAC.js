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

  class deleteChildTableAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const deleteSyncParamChildDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#deleteSyncParamChildDialog',
        method: 'setProperty',
        params: [
  'primaryKey',
  key,
],
      });

      const deleteSyncParamChildDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#deleteSyncParamChildDialog',
        method: 'open',
      });

      await Actions.callChain(context, {
        chain: 'PageVbEnterChain',
      });
    }
  }

  return deleteChildTableAC;
});
