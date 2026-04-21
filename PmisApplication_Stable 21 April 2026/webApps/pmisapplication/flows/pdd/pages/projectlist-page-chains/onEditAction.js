define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onEditAction extends ActionChain {
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow } = context;
      const enc_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: key,
        },
      });
      await Actions.navigateToPage(context, {
        page: 'projectlistedit',
        params: {
          pNavCode: 'EDIT',
          pNavId: enc_id,
          displayDtlVar: {
      "tenderName": current.row.tender_name,
      "tenderNumber": current.row.tender_number
      },
        },
      });
    }
  }

  return onEditAction;
});