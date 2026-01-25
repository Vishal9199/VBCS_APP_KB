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

  class childSaveAndCloseDialogAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

       let r=await Actions.callChain(context, {
        chain: 'childSaveAndEditAC',
      });

      if (r === 'S') {

        await Actions.callChain(context, {
          chain: 'childTableOnLoadAC',
        });
        const fidMenuEntriesDialogClose = await Actions.callComponentMethod(context, {
          selector: '#fid_menuEntriesDialog',
          method: 'close',
        });

        await Actions.resetVariables(context, {
          variables: [
    '$variables.subMenuVar',
  ],
        });
      }
    }
  }

  return childSaveAndCloseDialogAC;
});
