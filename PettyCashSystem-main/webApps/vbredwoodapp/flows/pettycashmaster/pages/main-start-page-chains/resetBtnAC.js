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

  class resetButtonAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;
      await Actions.resetVariables(context, {
        variables: [
    '$variables.SearchObj',
  ],
      });

      await $application.functions.clearSmartSearchChips();

      await Actions.callChain(context, {
        chain: 'vbAfterNavigateListener',
      });
    }
  }

  return resetButtonAC;
});