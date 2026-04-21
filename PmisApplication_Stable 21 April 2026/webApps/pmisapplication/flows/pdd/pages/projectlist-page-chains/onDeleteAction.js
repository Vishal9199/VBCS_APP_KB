define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onDeleteAction extends ActionChain {
    async run(context, { event, originalEvent, key, index, current }) {
      const { $variables } = context;
      $variables.selectedKey = key;
      $variables.selectedrow = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: current.row,
        },
      });
      
      await Actions.callComponentMethod(context, { selector: '#delete_dialog', method: 'open' });
    }
  }

  return onDeleteAction;
});