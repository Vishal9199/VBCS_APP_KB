define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class nextPageAC extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.OUT_HAS_NEXT !== 'Y') {
        return;
      }

      const currentOffset = parseInt($variables.searchObj.IN_OFFSET) || 0;
      const limit         = parseInt($variables.searchObj.IN_LIMIT)  || 30;

      $variables.searchObj = {
        ...$variables.searchObj,
        IN_OFFSET: String(currentOffset + limit)
      };

      await Actions.callChain(context, {
        chain: 'SynADPFutureProjectsAC',
      });
    }
  }

  return nextPageAC;
});