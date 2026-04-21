define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class nextBtnAC extends ActionChain {
    async run(context, { event, originalEvent }) {
      const { $variables } = context;
      const offset = parseInt($variables.searchObj.in_offset, 10) || 0;
      const limit  = parseInt($variables.searchObj.in_limit,  10) || 10;
      $variables.searchObj.in_offset = String(offset + limit);
      await Actions.callChain(context, { chain: 'vbAfterNavigateListener' });
    }
  }

  return nextBtnAC;
});