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

  class addUserAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      if ($variables.method === "POST") {
        let status = await Actions.callChain(context, {
          chain: 'addEditHeaderAC',
        });

        if (status !== "S") {
          return;
        }
      }

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

      const approvalRoleUserDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#approvalRoleUserDialog',
        method: 'open',
      });

      const approvalRoleUserDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#approvalRoleUserDialog',
        method: 'setProperty',
        params: [
          'method',
          'POST',
        ],
      });

    }
  }

  return addUserAC;
});
