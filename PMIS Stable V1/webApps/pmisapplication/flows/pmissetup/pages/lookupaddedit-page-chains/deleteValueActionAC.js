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

  class deleteValueActionAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.key 
     * @param {number} params.index 
     * @param {any} params.current 
     */
    async run(context, { key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const deleteLookupValueDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#deleteLookupValueDialog',
        method: 'setProperty',
        params: [
          'primaryKey',
          key,
        ],
      });
      const deleteLookupValueDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#deleteLookupValueDialog',
        method: 'open',
      });

    }
  }

  return deleteValueActionAC;
});