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
     * @param {any} params.key 
     * @param {number} params.index 
     * @param {any} params.current 
     */
    async run(context, { key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toApplicationPage = await Actions.navigateToPage(context, {
        page: 'lov-page',
        params: {
          key: key,
          op: 'PUT',
          applicationManagementVar: current.row,
        },
      });
    }
  }

  return editAC;
});
