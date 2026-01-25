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

  class deleteYesAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const primarykey= await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'getProperty',
        params: ['primarykey'],
      });

      const headerCode = await $application.functions.encryptJs($application.constants.secretKey, 'DELETE');

      const headerID = await $application.functions.encryptJs($application.constants.secretKey,primarykey);

      const response = await Actions.callRest(context, {
        endpoint: 'Menu/postMenuEntriesProcess',
        headers: {
          'X-cache-id': headerID,
          'X-cache-code': headerCode,
        },
      });

      await Actions.fireNotificationEvent(context, {
        summary: response.body.P_ERR_MSG,
        type: 'confirmation',
        displayMode: 'transient',
      });
      
      const deleteDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'close',
      });

      await Actions.callChain(context, {
        chain: 'childTableOnLoadAC',
      });
    }
  }

  return deleteYesAC;
});
