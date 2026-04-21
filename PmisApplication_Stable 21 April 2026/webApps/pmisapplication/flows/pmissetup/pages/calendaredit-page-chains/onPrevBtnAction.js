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

  class onPrevBtnAction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.searchObj.in_offset = (+$variables.searchObj.in_offset) + (-$variables.searchObj.in_limit);

      // ✅ RECALCULATE CURRENT PAGE
      const offset = parseInt($variables.searchObj.in_offset, 10);
      const limit = parseInt($variables.searchObj.in_limit, 10);
      $variables.currentPage = Math.floor(offset / limit) + 1;
      
      console.log("⬅️ Previous - Page:", $variables.currentPage, "Offset:", $variables.searchObj.in_offset);


      await Actions.callChain(context, {
        chain: 'vbAfterNavigateListener',
      });

    }
  }

  return onPrevBtnAction;
});