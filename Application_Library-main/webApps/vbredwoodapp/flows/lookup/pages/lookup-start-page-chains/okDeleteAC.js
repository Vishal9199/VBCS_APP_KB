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

      const deleteKey = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'getProperty',
        params: ['primaryKey']
      });

      // console.log("Primary Key from the dialog box : " + deleteKey);

      const headerId = await $application.functions.encryptJs($application.constants.secretKey, deleteKey);

      const headerCode = await $application.functions.encryptJs($application.constants.secretKey, 'DELETE');

      const response = await Actions.callRest(context, {
        endpoint: 'Look_Up/postLookupTypeProcess',
        headers: {
          'X-cache-code': headerCode,
          'X-cache-id': headerId,
        },
      });
      

      if (response?.body.P_ERR_CODE === "S") {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'confirmation',
        });


        await Actions.callChain(context, {
          chain: 'searchAC',
        });

      } else {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'error',
        });
      }

      const deleteDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'close',
      });


    }
  }

  return okDeleteAC;
});
