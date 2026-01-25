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

  class cancelLeaveBtnAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const unsavedChangesDialogClose = await Actions.callComponentMethod(context, {
        selector: '#unsavedChangesDialog',
        method: 'close',
      });
    }
  }

  return cancelLeaveBtnAC;
});
