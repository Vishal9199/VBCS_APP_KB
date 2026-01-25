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

  class addLookupValueAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      if ($variables.method === "POST") {
        const status = await Actions.callChain(context, {
          chain: 'syncParamChildAddEditAC',
        });

        if (status !== "S") {
          return;
        }
      }

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

      const paramChildDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#ParamChildDialog',
        method: 'open',
      });

      const paramChildDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#ParamChildDialog',
        method: 'setProperty',
        params: [
  'method',
  'POST',
],
      });


      $variables.ScheduleSyncParamSearchVar.sequence_no = Number(await $functions.getDisplayNum($variables.paramADP.data));

    }
  }

  return addLookupValueAC;
});
