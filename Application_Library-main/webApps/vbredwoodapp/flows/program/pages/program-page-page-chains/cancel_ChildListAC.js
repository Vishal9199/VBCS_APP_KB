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

  class cancel_ChildListAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const parameterConfigDialogClose = await Actions.callComponentMethod(context, {
        selector: '#parameterConfigDialog',
        method: 'close',
      });

      await Actions.resetVariables(context, {
        variables: [
          '$variables.parameterVar',
        ],
      });


      const dialogIds = [
        'dialog-param-code',
        'dialog-parlov-code',
        'dialog-lov-code',
        'dialog-field-type',
        'dialog-param-data-type',
        'dialog-param-label',
      ];

      await Promise.all(
        dialogIds.map(id =>
          Actions.callComponentMethod(context, {
            selector: `#${id}`,
            method: 'reset',
          })
        )
      );

    }
  }

  return cancel_ChildListAC;
});
