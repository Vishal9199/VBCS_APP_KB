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

  class onClosePrimary_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.resetVariables(context, {
        variables: [
    '$application.variables.menuSelection',
  ],
      });

      const toStatusupdate = await Actions.navigateToPage(context, {
        page: 'statusupdate',
        params: {
          pTenderId: $application.variables.pTenderId,
        },
      });
    }
  }

  return onClosePrimary_AC;
});
