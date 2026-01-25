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

  class save_closeAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const r = await Actions.callChain(context, {
        chain: 'childsaveAC',
      });

      if (r === 'S') {
        const userAccessDetailsDialogClose = await Actions.callComponentMethod(context, {
          selector: '#userAccessDetailsDialog',
          method: 'close',
        });
      }

      await Actions.resetVariables(context, {
        variables: [
    '$variables.userAccessChildVar',
  ],
      });
    }
  }

  return save_closeAC;
});
