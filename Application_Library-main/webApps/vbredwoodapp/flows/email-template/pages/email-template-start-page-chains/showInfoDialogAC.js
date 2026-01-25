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

  class showInfoDialogAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const infoDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#infoDialog',
        method: 'open',
      });
    }
  }

  return showInfoDialogAC;
});
