define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onCreateAction extends ActionChain {
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application } = context;
      await Actions.callChain(context, { chain: 'application:encryptAC', params: { input: '0' } });
      await Actions.navigateToPage(context, {
        page: 'projectlistedit',
        params: { pNavCode: 'CREATE', pNavId: '0' },
      });
    }
  }

  return onCreateAction;
});