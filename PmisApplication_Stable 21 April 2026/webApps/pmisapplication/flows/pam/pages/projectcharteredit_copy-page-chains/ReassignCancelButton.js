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

  class ReassignCancelButton extends ActionChain {

    /**
     * Reassign Cancel Button Action - Closes the reassign dialog without action
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const reassignPopupClose = await Actions.callComponentMethod(context, {
        selector: '#ReassignPopup',
        method: 'close',
      });

      await Actions.resetVariables(context, {
        variables: [
          '$page.variables.updateAction',
        ],
      });
    }
  }

  return ReassignCancelButton;
});