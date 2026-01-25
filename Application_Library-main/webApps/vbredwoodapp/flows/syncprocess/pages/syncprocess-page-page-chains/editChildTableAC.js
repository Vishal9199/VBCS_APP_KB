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

  class editChildTableAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.key 
     * @param {number} params.index 
     * @param {any} params.current 
     */
    async run(context, { key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {
      });

      if (dirtyDataStatus.status === "dirty" || $variables.isFormValid !== 'valid') {
        const status = await Actions.callChain(context, {
          chain: 'syncParamChildAddEditAC',
        });

        if (status !== "S") {
          return;
        }

      }

      $variables.ScheduleSyncParamSearchVar = current.row;

      const paramChildDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#ParamChildDialog',
        method: 'open',
      });
      const paramChildDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#ParamChildDialog',
        method: 'setProperty',
        params: [
  'method',
  'PUT',
],
      });


    }
  }

  return editChildTableAC;
});
