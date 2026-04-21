define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onCancelDeleteAction extends ActionChain {
    async run(context) {
      await Actions.callComponentMethod(context, { selector: '#delete_dialog', method: 'close' });
    }
  }

  return onCancelDeleteAction;
});