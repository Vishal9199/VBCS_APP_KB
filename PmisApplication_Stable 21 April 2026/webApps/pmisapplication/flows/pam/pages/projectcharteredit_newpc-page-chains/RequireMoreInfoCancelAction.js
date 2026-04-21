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

  class RequireMoreInfoCancelAction extends ActionChain {

    /**
     * Require More Info Cancel Action - Closes the require more info dialog without action
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const requireMoreInfoPopupClose = await Actions.callComponentMethod(context, {
        selector: '#requireMoreInfoPopup',
        method: 'close',
      });

      await Actions.resetVariables(context, {
        variables: [
          '$page.variables.updateAction',
        ],
      });
    }
  }

  return RequireMoreInfoCancelAction;
});