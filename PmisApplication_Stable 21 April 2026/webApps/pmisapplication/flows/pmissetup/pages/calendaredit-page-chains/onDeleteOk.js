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

  class onDeleteOk extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const temp_key = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'getProperty',
        params: [ 'enc_key',],
      });

      const temp_method = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'getProperty',
        params: [
  'enc_method',
],
      });

      const temp_payload = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'getProperty',
        params: [
  'enc_payload',
],
      });

      const response = await Actions.callRest(context, {
        endpoint: 'PmisSetup/postCalendarLineProcess',
        headers: {
          'x-session-id': temp_key,
          'x-session-code': temp_method,
        },
        body: {"payload": temp_payload},
      });

      await Actions.fireNotificationEvent(context, {
        summary: response.body.P_ERR_MSG,
        displayMode: 'transient',
        type: response.body.P_ERR_CODE === 'S' ? 'confirmation' : 'error',
      });

      if(response.body.P_ERR_CODE === 'S') {
        const deleteDialogClose = await Actions.callComponentMethod(context, {
          selector: '#deleteDialog',
          method: 'close',
        });

        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener',
        });
        
      }
    }
  }

  return onDeleteOk;
});
