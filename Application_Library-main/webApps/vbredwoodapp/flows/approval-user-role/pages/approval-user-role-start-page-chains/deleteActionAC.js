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

  class deleteActionAC extends ActionChain {

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

      const deleteDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'setProperty',
        params: ['primaryKey', key]
      });

      const deleteDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'open',
      });
      
    }
  }

  return deleteActionAC;
});
