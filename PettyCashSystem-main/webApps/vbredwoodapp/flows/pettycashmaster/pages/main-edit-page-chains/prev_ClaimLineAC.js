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

  class prev_ClaimLineAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.SearchObj_ClaimLine.in_limit = -(+$variables.SearchObj_ClaimLine.in_offset) + (+$variables.SearchObj_ClaimLine.in_limit);

      // ✅ RECALCULATE CURRENT PAGE
      const offset = parseInt($variables.SearchObj_ClaimLine.in_offset, 10);
      const limit = parseInt($variables.SearchObj_ClaimLine.in_limit, 10);
      $variables.currentPage = Math.floor(offset / limit) + 1;
      
      console.log("➡️ Next - Page:", $variables.currentPage, "Offset:", $variables.SearchObj_ClaimLine.in_offset);

      await Actions.callChain(context, {
        chain: 'loadLineTablesAC',
      });

    }
  }

  return prev_ClaimLineAC;
});
