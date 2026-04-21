define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class closePageAction extends ActionChain {
    async run(context) {
      await Actions.navigateBack(context, {});
    }
  }

  return closePageAction;
});