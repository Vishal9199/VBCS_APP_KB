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

  class prevBtnAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.searchValueObj.IN_OFFSET = +$variables.searchValueObj.IN_OFFSET - +$variables.searchValueObj.IN_LIMIT;

      await Actions.callChain(context, {
        chain: 'loadChildTableAC',
      });
    }
  }

  return prevBtnAC;
});