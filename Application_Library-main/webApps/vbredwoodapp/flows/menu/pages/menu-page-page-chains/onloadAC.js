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

  class onloadAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $application.variables.showNavigation = false;

      await Actions.callChain(context, {
        chain: 'headerOnload',
      });

      await Actions.callChain(context, {
        chain: 'childTableOnLoadAC',
      });

      await Actions.resetDirtyDataStatus(context, {
      });
    }
  }

  return onloadAC;
});
