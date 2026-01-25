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

  class cancel_ChildListAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const approvalHierarchyListDialogClose = await Actions.callComponentMethod(context, {
        selector: '#approvalHierarchyListDialog',
        method: 'close',
      });

      await Actions.resetVariables(context, {
        variables: [
    '$variables.approvalHierarchyListVar',
  ],
      });


      const dialogCategoryIdReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-category-id',
        method: 'reset',
      });

      const dialogLevelNumReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-level-num',
        method: 'reset',
      });

      const dialogTypeIdReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-type-id',
        method: 'reset',
      });

      const dialogUserIdReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-user-id',
        method: 'reset',
      });

      const dialogUserRoleIdReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-user-role-id',
        method: 'reset',
      });
      
    }
  }

  return cancel_ChildListAC;
});
