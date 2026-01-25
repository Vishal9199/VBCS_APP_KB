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

  class loadHeaderAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const response = await Actions.callRest(context, {
        endpoint: 'Program/getProgramDtl',
        headers: {
          'X-cache-id': $variables.key,
        },
      });

      if (response?.body?.count === 1) {
        $variables.programVar = response.body.items[0];
        await Actions.resetDirtyDataStatus(context, {
          variables: [
            '$variables.programVar',
          ],
        });

      }
    }
  }

  return loadHeaderAC;
});
