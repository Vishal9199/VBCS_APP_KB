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

  class childSaveAndAddAnotherAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

       const r= await Actions.callChain(context, {
        chain: 'childSaveAndEditAC',
      });

      if (r === 'S') {
         const  result = await Actions.callChain(context, {
          chain: 'childAddAC',
        });

        if (result === true) {
          const fidMenuEntriesDialogClose = await Actions.callComponentMethod(context, {
            selector: '#fid_menuEntriesDialog',
            method: 'close',
          });
        } else{

        await Actions.resetVariables(context, {
          variables: [
    '$variables.subMenuVar',
  ],
        });

          await Actions.fireDataProviderEvent(context, {
            refresh: null,
            target: $variables.getMenuLovFunctionName2ListSDP4,
          });

        await Actions.callChain(context, {
          chain: 'childTableOnLoadAC',
        });

        $variables.subMenuVar.entry_sequence = $variables.displaynum;
      }}
    }
  }

  return childSaveAndAddAnotherAC;
});
