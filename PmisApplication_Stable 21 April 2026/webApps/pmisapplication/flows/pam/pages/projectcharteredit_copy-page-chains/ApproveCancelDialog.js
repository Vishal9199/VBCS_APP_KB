define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',],
  (
    ActionChain,
    Actions,
    ActionUtils) => {
    'use strict';
    class ApproveCancelDialog extends ActionChain {
      /**      
       * * Approve Cancel Dialog Action - Closes the approve dialog without action      
       * * @param {Object} context      
       * */

      async run(context) {
        const { $page, $flow, $application, $constants, $variables } = context;
        const approvePopUpClose = await Actions.callComponentMethod(context, {
          selector: '#approvePopUp',
          method: 'close',
        });
        await Actions.resetVariables(context, {
          variables: [
            '$page.variables.updateAction',
          ],
        });
      }
    }
    return ApproveCancelDialog;
  });