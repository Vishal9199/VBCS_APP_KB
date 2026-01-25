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

  class prevBtnAc extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.SearchObj.IN_OFFSET = -(+$variables.SearchObj.IN_OFFSET) + +$variables.SearchObj.IN_LIMIT;



      await Actions.callChain(context, {
        chain: 'vbAfterNavigateListener',
      });

    }
  }

  return prevBtnAc;
});