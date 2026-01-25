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

  class deleteYesBtnAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;



      const key = await Actions.callComponentMethod(context, {
        selector: '#deleteSyncParamChildDialog',
        method: 'getProperty',
        params: [
  'primaryKey',
],
      });

      const headerCode = await $application.functions.encryptJs($application.constants.secretKey, 'DELETE');
      const headerId = await $application.functions.encryptJs($application.constants.secretKey, key);


      const response2 = await Actions.callRest(context, {
        endpoint: 'ScheduleProcess/postStgScheduleSyncParamProcess',
        headers: {
          'X-cache-code': headerCode,
          'X-cache-id': headerId,
        },
      });

      if (response2.body.P_ERR_CODE === 'S') {

        await Actions.fireNotificationEvent(context, {
          summary: response2.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'confirmation',
        });

        $variables.searchValueObj.OFFSET = 0;


        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
          params: {
            'lv_header_id': $variables.ScheduleSyncSearchVar.schedule_id,
          },
        });

      } else {

        await Actions.fireNotificationEvent(context, {
          summary: response2.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'error',
        });
      }

      const deleteSyncParamChildDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteSyncParamChildDialog',
        method: 'close',
      });
    }
  }

  return deleteYesBtnAC;
});
