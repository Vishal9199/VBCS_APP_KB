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

  class resetAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await $application.functions.clearSmartSearchChips();

      await Actions.resetVariables(context, {
        variables: [
    '$variables.searchObj.TABLE_NAME',
  ],
      });

      await Actions.callChain(context, {
        chain: 'onloadAC',
      });
    }
  }

  return resetAC;
});
