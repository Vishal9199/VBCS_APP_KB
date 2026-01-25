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
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const res =await Actions.callChain(context, {
        chain: 'childsaveAC',
      });

      if (res === 'S') {
        const status = await Actions.callChain(context, {
          chain: 'childAddAC',
        });

        if (status === true) {
          const userAccessDetailsDialogClose = await Actions.callComponentMethod(context, {
            selector: '#userAccessDetailsDialog',
            method: 'close',
          });
        }
       else{
        await Actions.resetVariables(context, {
          variables: [
    '$variables.userAccessChildVar.role_code',
    '$variables.userAccessChildVar.application_name',
    '$variables.userAccessChildVar.role_id',
    '$variables.userAccessChildVar.role_name',
    '$variables.userAccessChildVar.effective_start_date',
    '$variables.userAccessChildVar.effective_end_date',
    '$flow.variables.enddate',
  ],
        });

        await Actions.fireDataProviderEvent(context, {
          target: $variables.getAolUsrRoleLovRolenameListSDP2,
          refresh: null,
        });
       }
      
      }
    }
  }

  return childSaveAndAddAnotherAC;
});
