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

  class addButtonAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toMenu = await Actions.navigateToFlow(context, {
        flow: 'menu',
        target: 'parent',
        page: 'menu-page',
        params: {
          method: 'POST',
          primaryKey: 0,
        },
      });
    }
  }

  return addButtonAC;
});
