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

  class save_CloseChildListAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const parameterConfigDialogProperty = await Actions.callComponentMethod(context, {
        selector: '#parameterConfigDialog',
        method: 'getProperty',
        params: [
          'method',
        ],
      });

      let res = await Actions.callChain(context, {
        chain: 'childTableAddEditAC',
        params: {
          method: parameterConfigDialogProperty,
        },
      });

      if (res === "S") {

        const parameterConfigDialogClose = await Actions.callComponentMethod(context, {
          selector: '#parameterConfigDialog',
          method: 'close',
        });

        await Actions.resetVariables(context, {
          variables: [
    '$variables.parameterVar',
  ],
        });

        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
        });
      }

    }
  }

  return save_CloseChildListAC;
});
