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

  class saveLookupValueAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const lookupValueDialogProperty = await Actions.callComponentMethod(context, {
        selector: '#lookupValueDialog',
        method: 'getProperty',
        params: [
          'method',
        ],
      });

      const res = await Actions.callChain(context, {
        chain: 'lookupValueAddEditAC',
        params: {
          method: lookupValueDialogProperty,
        },
      });

      if (res === "S") {

        const lookupValueDialogClose = await Actions.callComponentMethod(context, {
          selector: '#lookupValueDialog',
          method: 'close',
        });

        await Actions.resetVariables(context, {
          variables: [
            '$variables.lookupValueVar',
          ],
        });

        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
        });

      }
    }
  }

  return saveLookupValueAC;
});