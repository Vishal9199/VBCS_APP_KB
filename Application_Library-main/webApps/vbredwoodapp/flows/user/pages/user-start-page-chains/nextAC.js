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

  class previousPage extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.userSearch.IN_OFFSET= +$variables.userSearch.IN_OFFSET + +$variables.userSearch.IN_LIMIT;

      await Actions.callChain(context, {
        chain: 'searchDataAC',
      });
    }
  }

  return previousPage;
});