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

  class onLineCancel extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const lineDialogClose = await Actions.callComponentMethod(context, {
        selector: '#lineDialog',
        method: 'close',
      });
    }
  }

  return onLineCancel;
});
