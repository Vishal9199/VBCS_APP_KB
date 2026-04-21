define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class resetSearchAC extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await $application.functions.clearSmartSearchChips();

      await Actions.resetVariables(context, {
        variables: [
          '$variables.searchObj',
          '$variables.filterCriterion'
        ],
      });

      await Actions.callChain(context, {
        chain: 'SynADPFutureProjectsAC',
      });
    }
  }

  return resetSearchAC;
});