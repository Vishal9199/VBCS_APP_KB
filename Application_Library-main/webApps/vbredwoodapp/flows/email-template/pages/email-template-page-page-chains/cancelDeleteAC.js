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

  class cancelDeleteAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const deleteLookupValueDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteLookupValueDialog',
        method: 'close',
      });
    }
  }

  return cancelDeleteAC;
});
