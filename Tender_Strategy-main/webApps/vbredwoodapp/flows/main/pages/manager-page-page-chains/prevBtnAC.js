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

      $variables.SearchObj.in_offset = (+$variables.SearchObj.in_offset) + (-$variables.SearchObj.in_limit);

      // ✅ RECALCULATE CURRENT PAGE
      const offset = parseInt($variables.SearchObj.in_offset, 10);
      const limit = parseInt($variables.SearchObj.in_limit, 10);
      $variables.currentPage = Math.floor(offset / limit) + 1;
      
      console.log("⬅️ Previous - Page:", $variables.currentPage, "Offset:", $variables.SearchObj.in_offset);


      await Actions.callChain(context, {
        chain: 'vbAfterNavigateListener',
        params: {
          callRest: true,
        },
      });

    }
  }

  return prevBtnAC;
});