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

  class vbEnterListener extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $application.variables.showNavigation = true;

      await $application.functions.updateSmartSearchPlaceHolder();

      await Actions.callChain(context, {
        chain: 'searchAC',
      });

    }
  }

  return vbEnterListener;
});
