define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class vbEnterListener extends ActionChain {
    async run(context) {
      const { $page, $flow, $application, $variables } = context;

      // Initialize all 4 BufferingDataProviders by calling the SyncADP chain
      await Actions.callChain(context, { chain: 'vbAfterNavigateListener', params: { event: {} } });
    }
  }

  return vbEnterListener;
});