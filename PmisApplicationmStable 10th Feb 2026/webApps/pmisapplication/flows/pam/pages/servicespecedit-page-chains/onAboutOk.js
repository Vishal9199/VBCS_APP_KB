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

  class onAboutOk extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const aboutDialogClose = await Actions.callComponentMethod(context, {
        selector: '#aboutDialog',
        method: 'close',
      });
    }
  }

  return onAboutOk;
});
