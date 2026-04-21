define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class secondaryActionListener extends ActionChain {
    async run(context, { actionId, event }) {
      const { $variables } = context;
      switch (actionId) {
        case 'save':
          await Actions.callChain(context, { chain: 'saveProjectlistData', params: { closeAfterSave: false } });
          break;
        case 'saveClose':
          await Actions.callChain(context, { chain: 'saveProjectlistData', params: { closeAfterSave: true } });
          break;
        case 'about':
          await Actions.callComponentMethod(context, { selector: '#aboutDialog', method: 'open' });
          break;
        default:
          console.warn('Unknown secondary action:', actionId);
      }
    }
  }

  return secondaryActionListener;
});