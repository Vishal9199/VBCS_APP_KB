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

  class cancelAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const fidMenuEntriesDialogClose = await Actions.callComponentMethod(context, {
        selector: '#fid_menuEntriesDialog',
        method: 'close',
      });

       const promptInputReset = await Actions.callComponentMethod(context, {
         selector: '#prompt-input',
         method: 'reset',
       });

      

      const functionNameSelectReset = await Actions.callComponentMethod(context, {
        selector: '#function-name-select',
        method: 'reset',
      });

      const submenuNameSelectReset = await Actions.callComponentMethod(context, {
        selector: '#submenu-name-select',
        method: 'reset',
      });

      await Actions.resetVariables(context, {
        variables: [
    '$variables.subMenuVar',
  ],
      });
    }
  }

  return cancelAC;
});
