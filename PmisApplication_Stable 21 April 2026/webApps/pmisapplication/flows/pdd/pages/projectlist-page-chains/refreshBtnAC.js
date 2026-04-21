define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class refreshBtnAC extends ActionChain {
    async run(context, { event, originalEvent }) {
      await Actions.callChain(context, { chain: 'vbAfterNavigateListener' });
    }
  }

  return refreshBtnAC;
});