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

  class editAC extends ActionChain {

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

      const userAccessDetailsDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#userAccessDetailsDialog',
        method: 'setProperty',
        params: ['method','PUT'],
      });

      $variables.userAccessChildVar = current.row;

      $variables.user_hide = 'hide';

      const userAccessDetailsDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#userAccessDetailsDialog',
        method: 'open',
      });
    }
  }

  return editAC;
});
