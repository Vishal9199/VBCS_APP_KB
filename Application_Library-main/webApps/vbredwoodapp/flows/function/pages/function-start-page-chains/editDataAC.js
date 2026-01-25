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

  class editDataAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.key 
     * @param {number} params.index 
     * @param {any} params.current 
     */
    async run(context, { key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;
      const toFunctionPage = await Actions.navigateToPage(context, {
        page: 'function-page',
        params: {
          method: 'PUT',
          primaryKey: key,
          functionDetailsVar: current.row,
        },
      });
    }
  }

  return editDataAC;
});
