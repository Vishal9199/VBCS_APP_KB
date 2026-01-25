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

  class next_ClaimLineAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.SearchObj_ClaimLine.in_offset = String(
      parseInt($variables.SearchObj_ClaimLine.in_offset, 10) + parseInt($variables.SearchObj_ClaimLine.in_limit, 10));

      await Actions.callChain(context, {
        chain: 'loadLineTablesAC',
      });

    }
  }

  return next_ClaimLineAC;
});
