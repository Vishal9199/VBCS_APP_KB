define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class closeAboutDialog extends ActionChain {
    async run(context) {
      await Actions.callComponentMethod(context, { selector: '#aboutDialog', method: 'close' });
    }
  }

  return closeAboutDialog;
});