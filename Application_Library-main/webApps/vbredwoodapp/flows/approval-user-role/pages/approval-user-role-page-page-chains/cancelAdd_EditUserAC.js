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

  class cancelAdd_EditUserAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const approvalRoleUserDialogClose = await Actions.callComponentMethod(context, {
        selector: '#approvalRoleUserDialog',
        method: 'close',
      });

      await Actions.resetVariables(context, {
        variables: [
    '$variables.approvalRoleUserVar',
  ],
      });

      const dialogOrderNumberReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-order-number',
        method: 'reset',
      });

      const dialogUserNameReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-user-name',
        method: 'reset',
      });
    }
  }

  return cancelAdd_EditUserAC;
});
