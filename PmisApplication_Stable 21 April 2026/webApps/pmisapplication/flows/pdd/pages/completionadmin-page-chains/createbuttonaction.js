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

  class createbuttonaction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toCompletionadminaddedit = await Actions.navigateToPage(context, {
        page: 'completionadminaddedit',
        params: {
          pNavCode: 'CREATE',
          pNavId: '0',
        },
      });
    }
  }

  return createbuttonaction;
});
