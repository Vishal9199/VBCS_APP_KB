define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class prevPageAC extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const currentOffset = parseInt($variables.searchObj.IN_OFFSET) || 0;
      const limit         = parseInt($variables.searchObj.IN_LIMIT)  || 30;

      if (currentOffset <= 0) {
        return;
      }

      $variables.searchObj = {
        ...$variables.searchObj,
        IN_OFFSET: String(Math.max(0, currentOffset - limit))
      };

      await Actions.callChain(context, {
        chain: 'SynADPFutureProjectsAC',
      });
    }
  }

  return prevPageAC;
});