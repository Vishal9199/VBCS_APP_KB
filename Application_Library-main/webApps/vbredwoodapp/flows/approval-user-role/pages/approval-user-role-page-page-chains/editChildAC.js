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

  class editChildAC extends ActionChain {

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

      const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {
      });

      if (dirtyDataStatus.status === "dirty" || $variables.validationGroupVars.isHeaderFormValid !== 'valid') {
        let status = await Actions.callChain(context, {
          chain: 'addEditHeaderAC',
        });

        if (status !== "S") {
          return;
        }

      }

      $variables.approvalRoleUserVar = current.row;

      const approvalRoleUserDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#approvalRoleUserDialog',
        method: 'open',
      });
      const approvalRoleUserDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#approvalRoleUserDialog',
        method: 'setProperty',
        params: [
          'method',
          'PUT',
        ],
      });
      
    }
  }

  return editChildAC;
});
