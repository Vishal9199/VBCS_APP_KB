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

  class saveAddAnotherLookupValueAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

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

        await Actions.resetVariables(context, {
          variables: [
            '$variables.lookupValueVar',
          ],
        });

        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
        });

        $variables.lookupValueVar.display_order = await $functions.getDisplayNum($variables.ADPlookupValue.data);

      }
    }
  }

  return saveAddAnotherLookupValueAC;
});