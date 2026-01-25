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

  class cancelDeleteSectionAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const deleteSectionDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteSectionDialog',
        method: 'close',
      });
    }
  }

  return cancelDeleteSectionAC;
});
