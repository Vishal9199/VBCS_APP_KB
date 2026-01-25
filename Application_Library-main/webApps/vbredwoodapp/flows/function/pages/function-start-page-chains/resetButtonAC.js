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
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await $application.functions.clearSmartSearchChips();

      await Actions.resetVariables(context, {
        variables: [
    '$variables.searchObj',
  ],
      });

      await Actions.callChain(context, {
        chain: 'onLoadAC',
      });
    }
  }

  return resetAC;
});
