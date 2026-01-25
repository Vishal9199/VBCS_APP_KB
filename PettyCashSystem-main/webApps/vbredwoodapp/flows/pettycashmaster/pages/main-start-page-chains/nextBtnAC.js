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

  class nextBtnAc extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;


      $variables.SearchObj.in_offset = String(
        parseInt($variables.SearchObj.in_offset, 10) + parseInt($variables.SearchObj.in_limit, 10));

      // ✅ RECALCULATE CURRENT PAGE
      const offset = parseInt($variables.SearchObj.in_offset, 10);
      const limit = parseInt($variables.SearchObj.in_limit, 10);
      $variables.currentPage = Math.floor(offset / limit) + 1;
      
      console.log("➡️ Next - Page:", $variables.currentPage, "Offset:", $variables.SearchObj.in_offset);


      await Actions.callChain(context, {
        chain: 'vbAfterNavigateListener',
      }, { id: 'prevBtnAc' });

    }
  }

  return nextBtnAc;
});