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

  class addAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toRolePage = await Actions.navigateToPage(context, {
        page: 'role-page',
        params: {
          'P_METHOD': 'POST',
          'P_PRIMARY_KEY': '0',
        },
      });
    }
  }

  return addAC;
});
