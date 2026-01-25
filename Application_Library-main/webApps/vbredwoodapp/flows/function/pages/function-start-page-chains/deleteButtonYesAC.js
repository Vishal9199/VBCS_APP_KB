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

  class okDeleteAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const primaryKey = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'getProperty',
        params: ['primaryKey']
      });

   



      

      const headerCode = await $application.functions.encryptJs($flow.constants.secretKey, 'DELETE');

      const headerID = await $application.functions.encryptJs($flow.constants.secretKey, primaryKey);

      const response = await Actions.callRest(context, {
        endpoint: 'Function/postFunctionProcess',
        headers: {
          'X-cache-code': headerCode,
          'X-cache-id': headerID,
        },
      });

      await Actions.callChain(context, {
        chain: 'onLoadAC',
      });

      await Actions.fireNotificationEvent(context, {
        summary: response.body.P_ERR_MSG,
        displayMode: 'transient',
        type: 'confirmation',
      });

      const deleteDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'close',
      });

      await Actions.fireDataProviderEvent(context, {
        target: $variables.getFunctionLovFunctionNameListSDP2,
        refresh: null,
      });
    }
  }

  return okDeleteAC;
});
