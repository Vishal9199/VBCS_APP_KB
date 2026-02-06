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

  class editLookupValueAC extends ActionChain {

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
          chain: 'lookupTypeAddEditAc',
        });

        if (status !== "S") {
          return;
        }

      }

      $variables.lookupValueVar = current.row;

      console.log("Check 01:", JSON.stringify($variables.lookupValueVar));

      const lookupValueDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#lookupValueDialog',
        method: 'open',
      });
      const lookupValueDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#lookupValueDialog',
        method: 'setProperty',
        params: [
          'method',
          'PUT',
        ],
      });


    }
  }

  return editLookupValueAC;
});