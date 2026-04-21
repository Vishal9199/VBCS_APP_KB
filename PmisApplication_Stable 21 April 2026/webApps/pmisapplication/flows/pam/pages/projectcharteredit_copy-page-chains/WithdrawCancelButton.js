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

  class WithdrawCancelButton extends ActionChain {

    /**
     * Withdraw Cancel Button Action - Closes the withdraw dialog without action
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const withdrawPopupClose = await Actions.callComponentMethod(context, {
        selector: '#withdrawPopup',
        method: 'close',
      });

      await Actions.resetVariables(context, {
        variables: [
          '$page.variables.updateAction',
        ],
      });
    }
  }

  return WithdrawCancelButton;
});