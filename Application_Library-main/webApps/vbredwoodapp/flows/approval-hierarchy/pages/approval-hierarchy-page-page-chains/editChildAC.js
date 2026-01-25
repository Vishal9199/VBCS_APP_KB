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
          chain: 'headerAddEditAC',
        });

        if (status !== "S") {
          return;
        }

      }

      $variables.approvalHierarchyListVar = current.row;

      const approvalHierarchyListDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#approvalHierarchyListDialog',
        method: 'open',
      });
      const approvalHierarchyListDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#approvalHierarchyListDialog',
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
