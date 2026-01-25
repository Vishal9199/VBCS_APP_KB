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
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const key = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'getProperty',
        params: [
  'key',
],
      });

       const headerCode = await $application.functions.encryptJs($application.constants.secretKey, 'DELETE');

      const headerID = await $application.functions.encryptJs($application.constants.secretKey, key);

      const response = await Actions.callRest(context, {
        endpoint: 'User/postAol_usrUserProcess',
        headers: {
          'X-cache-code': headerCode,
          'X-cache-id': headerID,
        },
      });

      if (response.body.P_ERR_CODE === 'S') {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          type: 'confirmation',
          displayMode: 'transient',
        });
      }
      
      const deleteDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'close',
      });

      await Actions.callChain(context, {
        chain: 'vbEnterListener',
      });

    }
  }

  return deleteYesAC;
});
