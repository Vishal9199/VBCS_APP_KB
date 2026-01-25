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

  class onLoadAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

       

      if (true) {

        $application.variables.showNavigation = true;

        await $application.functions.updateSmartSearchPlaceHolder();

        await Actions.callChain(context, {
          chain: 'searchDataAC',
        });
      }
    }
  }

  return onLoadAC;
});
