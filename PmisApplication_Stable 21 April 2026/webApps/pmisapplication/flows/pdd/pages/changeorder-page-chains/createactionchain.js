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

  class createactionchain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toChangeorderaddedit = await Actions.navigateToPage(context, {
        page: 'changeorderaddedit',
        params: {
          pNavCode: 'CREATE',
          pNavId: '0',
          pTenderId: $variables.pTenderId,
        },
      });
    }
  }

  return createactionchain;
});
