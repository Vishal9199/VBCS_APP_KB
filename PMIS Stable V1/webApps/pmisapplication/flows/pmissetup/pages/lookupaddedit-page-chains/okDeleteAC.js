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



      const key = await Actions.callComponentMethod(context, {
        selector: '#deleteLookupValueDialog',
        method: 'getProperty',
        params: ['primaryKey'],
      });

      const headerCode = await $application.functions.encryptJs2($application.constants.secretKey, 'DELETE');
      const headerId = await $application.functions.encryptJs2($application.constants.secretKey, key);


      const response = await Actions.callRest(context, {
        endpoint: 'AOL/postLookupValueProcess',
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

        $variables.searchValueObj.IN_OFFSET = 0;


        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
        });

      } else {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'error',
        });
      }

      const deleteLookupValueDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteLookupValueDialog',
        method: 'close',
      });
    }
  }

  return okDeleteAC;
});