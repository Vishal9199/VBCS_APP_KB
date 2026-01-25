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

  class HyperlinkClickChain1 extends ActionChain {

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

      const toRole = await Actions.navigateToFlow(context, {
        flow: 'role',
        target: 'parent',
        page: 'role-page',
        params: {
          'P_METHOD': 'PUT',
          'P_PRIMARY_KEY': current.row.role_id,
        },
      });
    }
  }

  return HyperlinkClickChain1;
});
