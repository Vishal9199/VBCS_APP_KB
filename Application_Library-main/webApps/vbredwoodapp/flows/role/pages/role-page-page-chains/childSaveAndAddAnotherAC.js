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

      const res = await Actions.callChain(context, {
        chain: 'childTableEditSaveAC',
      });

      if (res === 'S') {
        const status = await Actions.callChain(context, {
          chain: 'childAddAC',
        });

        if (status === true) {
          const userDialogClose = await Actions.callComponentMethod(context, {
            selector: '#userDialog',
            method: 'close',
          });
        }
       else{
        await Actions.resetVariables(context, {
          variables: [
            '$variables.childUser.user_name',
            '$variables.childSearch.EFFECTIVE_END_DATE',
            '$variables.childSearch.EFFECTIVE_START_DATE',
          ],
        });

        await Actions.fireDataProviderEvent(context, {
          target: $variables.getAolUsrRoleLovUserNameListSDP3,
          refresh: null,
        });

        $variables.childUser.effective_start_date = $application.functions.todayDate();}
      }
    }
  }

  return childSaveAndAddAnotherAC;
});
