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

  class navigateToFunction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.key 
     * @param {number} params.index 
     * @param {any} params.current 
     */
    async run(context, { key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toFunction = await Actions.navigateToFlow(context, {
        flow: 'function',
        target: 'parent',
        page: 'function-page',
        params: {
          isFunctionCodeReadOnly: true,
          method: 'PUT',
          primaryKey: current.row.function_id,
        },
      });
    }
  }

  return navigateToFunction;
});
