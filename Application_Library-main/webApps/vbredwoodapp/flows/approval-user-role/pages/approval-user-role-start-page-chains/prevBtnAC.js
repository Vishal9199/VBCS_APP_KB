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
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.searchObj.IN_OFFSET = +$variables.searchObj.IN_OFFSET - +$variables.searchObj.IN_LIMIT;

      await Actions.callChain(context, {
        chain: 'searchAC',
      });
      
    }
  }

  return prevBtnAC;
});
