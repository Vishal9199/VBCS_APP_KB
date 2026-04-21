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

  class RejectCancelButton extends ActionChain {

    /**
     * Reject Cancel Button Action - Closes the reject dialog without action
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const rejectPopupClose = await Actions.callComponentMethod(context, {
        selector: '#RejectPopup',
        method: 'close',
      });

      await Actions.resetVariables(context, {
        variables: [
          '$page.variables.updateAction',
        ],
      });
    }
  }

  return RejectCancelButton;
});