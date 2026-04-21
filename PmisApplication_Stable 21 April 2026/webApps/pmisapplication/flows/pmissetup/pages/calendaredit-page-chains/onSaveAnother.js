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

  class onSaveAnother extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.isSaveAndClose = 'N';

      await Actions.callChain(context, {
        chain: 'onLineSave',
        params: {
          isSaveAndClose: $variables.isSaveAndClose,
        },
      });
    }
  }

  return onSaveAnother;
});
