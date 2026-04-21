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

  class editactionchain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toChangeorderaddedit = await Actions.navigateToPage(context, {
        page: 'changeorderaddedit',
        params: {
          pNavCode: 'EDIT',
          pNavId: key,
          pTenderId: $variables.pTenderId,
        },
      });
    }
  }

  return editactionchain;
});
