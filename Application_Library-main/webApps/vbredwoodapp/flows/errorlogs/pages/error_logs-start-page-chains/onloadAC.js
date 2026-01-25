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



      

      $application.variables.showNavigation = true;

      await Actions.callChain(context, {
        chain: 'searchMenuDataAC',
      });

      await $application.functions.updateSmartSearchPlaceHolder();
    }
  }

  return onLoadAC;
});