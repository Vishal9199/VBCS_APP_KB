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

  class deleteChildListAC extends ActionChain {

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

      const deleteApprovalHierarchyListDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#deleteApprovalHierarchyListDialog',
        method: 'setProperty',
        params: [
          'primaryKey',
          key,
        ],
      });

      $variables.approvalHierarchyListVar = current.row;

      const deleteApprovalHierarchyListDialogOpen2 = await Actions.callComponentMethod(context, {
        selector: '#deleteApprovalHierarchyListDialog',
        method: 'open',
      });
    }
  }

  return deleteChildListAC;
});
