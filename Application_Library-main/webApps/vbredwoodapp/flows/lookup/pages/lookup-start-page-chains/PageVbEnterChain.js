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

  class PageVbEnterChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      $application.variables.showNavigation = true;

      await $application.functions.updateSmartSearchPlaceHolder();

      await Actions.callChain(context, {
        chain: 'searchAC',
      });
    }
  }

  return PageVbEnterChain;
});
