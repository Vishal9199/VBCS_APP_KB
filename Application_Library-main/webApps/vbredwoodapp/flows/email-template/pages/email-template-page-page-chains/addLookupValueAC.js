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
          chain: 'lookupTypeAddEditAc',
        });

        if (status !== "S") {
          return;
        }
      }

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

      const lookupValueDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#lookupValueDialog',
        method: 'open',
      });

      const lookupValueDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#lookupValueDialog',
        method: 'setProperty',
        params: [
          'method',
          'POST',
        ],
      });


    }
  }

  return addLookupValueAC;
});
