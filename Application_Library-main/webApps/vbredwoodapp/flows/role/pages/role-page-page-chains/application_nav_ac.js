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

  class application_nav_ac extends ActionChain {

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

      const toApplication = await Actions.navigateToFlow(context, {
        flow: 'application',
        target: 'parent',
        page: 'lov-page',
        params: {
          key: current.row.application_id,
          op: 'PUT',
        },
      });
    }
  }

  return application_nav_ac;
});
