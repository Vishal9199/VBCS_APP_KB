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

  class addAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toFunctionPage = await Actions.navigateToPage(context, {
        page: 'function-page',
        params: {
          method: 'POST',
          primaryKey: 0,
          isFunctionCodeReadOnly: false,
        },
      });
    }
  }

  return addAC;
});
