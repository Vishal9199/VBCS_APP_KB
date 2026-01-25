define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ActionUtils
) => {
  'use strict';

  class addBtnAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toSyncprocessPage = await Actions.navigateToPage(context, {
        page: 'syncprocess-page',
        params: {
          key: '0',
          method: 'POST',
        },
      });
    }
  }

  return addBtnAC;
});
