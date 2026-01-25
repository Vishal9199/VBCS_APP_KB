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

  class saveAndCloseAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.callChain(context, {
        chain: 'createEditAC',
      });

      const toFunctionStart = await Actions.navigateToPage(context, {
        page: 'function-start',
      });
    }
  }

  return saveAndCloseAC;
});
