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

  class onHasNext extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

    $variables.searchObj.in_offset = String(parseInt($variables.searchObj.in_offset,10)+parseInt($variables.searchObj.in_limit,10));
      $variables.currentPage = Math.floor(+$variables.searchObj.in_offset / +$variables.searchObj.in_limit) + 1;

      await Actions.callChain(context, {
        chain: 'vbEnterListener',
      });

    }
  }

  return onHasNext;
});
