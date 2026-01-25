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

      if ($variables.P_METHOD === 'POST') {
        await Actions.callChain(context, {
          chain: 'headerEditSaveAC',
        });
      }

      if ($variables.validform.isHeaderFormValid === 'valid') {

        await Actions.fireDataProviderEvent(context, {
          target: $variables.getAolUsrRoleLovUserNameListSDP3,
          refresh: null,
        });

        const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {
        });

        let status ='S';

        if (dirtyDataStatus.status === "dirty" || $variables.validform.isHeaderFormValid !== 'valid') {

          status = await Actions.callChain(context, {
            chain: 'headerEditSaveAC',
          });



        } 
          const sysdate = await $application.functions.getSysdate();

        const sdp = await Actions.callRest(context, {
          endpoint: 'User/getAol_usrRoleLovUserName',
          headers: {
            'P_ROLE_ID': $variables.roleManagementVar.role_id,
          },
        });
        let count = sdp.body.count;

        if (status === "S" && $variables.P_METHOD === "PUT" && sdp.body.count >= 1){
 
     

          await Actions.resetVariables(context, {
            variables: [
    '$variables.childUser',
  ],
          });

          await Actions.callChain(context, {
            chain: 'vbEnterListener',
          });

          $variables.user_field_hide = 'create';

          const userDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#userDialog',
            method: 'open',
          });

    

          const userDialogSetProperty = await Actions.callComponentMethod(context, {
            selector: '#userDialog',
            method: 'setProperty',
            params: ['method','POST'],
          });

          $variables.childUser.role_name = $variables.roleManagementVar.role_name;

          $variables.childUser.active_flag = 'Y';
          $variables.childUser.effective_start_date = await $application.functions.removeTimeStamp(sysdate);

          $variables.childUser.effective_end_date = '4712-12-31';

          $variables.minDate = await $functions.getNextDay($variables.childUser.effective_start_date);
        }
        else{
         const result = true ;
         await Actions.fireNotificationEvent(context, {
            summary: 'All User Has Been Added To This Role',
            displayMode: 'transient',
            type: 'info',
          });

          return result;
          
        }
      }
      
   

    }
  }

  return childAddAC;
});
