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

  class childSaveAndSaveAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const res=await Actions.callChain(context, {
        chain: 'childTableEditSaveAC',
      });

      if (res === 'S') {
        const userDialogClose = await Actions.callComponentMethod(context, {
          selector: '#userDialog',
          method: 'close',
        });

        await Actions.resetVariables(context, {
          variables: [
    '$variables.childUser',
  ],
        });
      }
    }
  }

  return childSaveAndSaveAC;
});
