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

  class onDeleteCancel extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const deleteDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'close',
      });
    }
  }

  return onDeleteCancel;
});
