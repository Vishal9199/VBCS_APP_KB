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

  class DialogCloseChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.resetVariables(context, {
        variables: [
          '$variables.lookupValueVar',
        ],
      });

      const dialogLookupValueCodeReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-lookup-value-code',
        method: 'reset',
      });

      const dialogLookupValueNameReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-lookup-value-name',
        method: 'reset',
      });

      
    }
  }

  return DialogCloseChain;
});
