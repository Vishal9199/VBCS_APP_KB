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

  class editChildAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {
      });

      if (dirtyDataStatus.status === "dirty" || $variables.validationGroupVars.isHeaderFormValid !== 'valid') {
        let status = await Actions.callChain(context, {
          chain: 'headerAddEditAC',
        });

        if (status !== "S") {
          return;
        }

      }

      $variables.fieldTypeArray = await $functions.getFieldTypeArray(current.row.field_type);

      $variables.parameterVar = current.row;

      const parameterConfigDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#parameterConfigDialog',
        method: 'open',
      });
      const parameterConfigDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#parameterConfigDialog',
        method: 'setProperty',
        params: [
          'method',
          'PUT',
        ],
      });

    }
  }

  return editChildAC;
});
