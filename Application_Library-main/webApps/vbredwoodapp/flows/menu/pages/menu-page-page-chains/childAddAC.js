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

  class childAddAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;
      if ($variables.method === 'POST') {

        const res = await Actions.callChain(context, {
          chain: 'headerEditSaveAC',
        });
      }

      if ($variables.validform.isHeaderFormValid === 'valid') {

        const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {
        });

        let status ='S';

        if (dirtyDataStatus.status === "dirty" || $variables.validform.isHeaderFormValid !== 'valid') {

          status = await Actions.callChain(context, {
            chain: 'headerEditSaveAC',
          });


        }

        const sdp = await Actions.callRest(context, {
          endpoint: 'Menu/getMenuLovFunctionName2',
          uriParams: {
            'p_menu_id': $variables.menuVar.menu_id,
          },
        });

        if (status === "S" && $variables.method === "PUT" && sdp.body.count >= 1  ){
 
     

          await Actions.resetVariables(context, {
            variables: [
    '$variables.subMenuVar',
  ],
          });

          $variables.function_field_hide = 'create';

          const fidMenuEntriesDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#fid_menuEntriesDialog',
            method: 'open',
          });
          const fidMenuEntriesDialogSetProperty = await Actions.callComponentMethod(context, {
            selector: '#fid_menuEntriesDialog',
            method: 'setProperty',
            params: ['method','POST'],
          });

          $variables.subMenuVar.active_flag = 'Y';

          // $variables.subMenuVar.entry_sequence = await $functions.getDisplayNum($variables.ADPsubmenuValue.data);
          $variables.subMenuVar.entry_sequence = $variables.displaynum;
        }
        else{
   
         const result = true
         await Actions.fireNotificationEvent(context, {
           summary: 'All Function Has Been Added ',
           displayMode: 'transient',
           type: 'info',
         });

          return result;
          

        }
      }
     else{
        await Actions.fireNotificationEvent(context, {
          summary: 'Please Fix The Highlighted Issue',
          displayMode: 'persist',
          type: 'warning',
        });
      
     }

    }
  }

  return childAddAC;
});
