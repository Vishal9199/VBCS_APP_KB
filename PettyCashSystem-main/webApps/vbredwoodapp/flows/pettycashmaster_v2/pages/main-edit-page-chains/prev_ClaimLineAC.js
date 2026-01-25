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

      await Actions.callChain(context, {
        chain: 'loadLineTablesAC',
      });

    }
  }

  return prev_ClaimLineAC;
});
