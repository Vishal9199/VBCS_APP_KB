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

  class onClikEditAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.key 
     * @param {number} params.index 
     * @param {any} params.current 
     */
    async run(context, { key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toMenu = await Actions.navigateToFlow(context, {
        flow: 'menu',
        target: 'parent',
        page: 'menu-page',
        params: {
          menuVar: current.row,
          method: 'PUT',
          key: key,
          childAdd: false,
          primaryKey: key,
        },
      });
    }
  }

  return onClikEditAC;
});
