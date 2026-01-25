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


      $variables.SearchObj.IN_OFFSET = String(
        parseInt($variables.SearchObj.IN_OFFSET, 10) + parseInt($variables.SearchObj.IN_LIMIT, 10));



      await Actions.callChain(context, {
        chain: 'vbEnterListener',
      }, { id: 'prevBtnAc' });

    }
  }

  return prevBtnAc;
});