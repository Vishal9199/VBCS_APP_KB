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

  class onHasPrev extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

 $variables.searchObj.IN_OFFSET = String(parseInt($variables.searchObj.IN_OFFSET,10)-parseInt($variables.searchObj.IN_LIMIT,10));
      $variables.searchObj.in_offset = +$variables.searchObj.in_offset - +$variables.searchObj.in_limit;

      await Actions.callChain(context, {
        chain: 'vbEnterListener',
      });


    }
  }

  return onHasPrev;
});
