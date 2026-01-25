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

  class addApprovalUserRoleAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toApprovalUserRolePage = await Actions.navigateToPage(context, {
        page: 'approval-user-role-page',
        params: {
          key: '0',
        },
      });
    }
  }

  return addApprovalUserRoleAC;
});
