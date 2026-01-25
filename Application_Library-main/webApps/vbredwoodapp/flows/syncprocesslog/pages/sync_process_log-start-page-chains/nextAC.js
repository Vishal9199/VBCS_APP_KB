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

  class nextPage extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.searchObj.OFFSET= +$variables.searchObj.OFFSET + +$variables.searchObj.LIMIT;

      await Actions.callChain(context, {
        chain: 'onloadAC',
      });
    }
  }

  return nextPage;
});