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
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const deleteKey = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'getProperty',
        params: ['primaryKey']
      });
      const body = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'getProperty',
        params: ['body']
      });

      

      // console.log("Primary Key from the dialog box : " + deleteKey);

      const headerId = await $application.functions.encryptJs($application.constants.secretKey, deleteKey);

      const headerCode = await $application.functions.encryptJs($application.constants.secretKey, 'DELETE');

      body.last_updated_by = $application.user.fullName;
      body.last_updated_date = await $application.functions.getSysdate();
      body.last_updated_login = $application.user.fullName;

      $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, body);

      const response = await Actions.callRest(context, {
        endpoint: 'Program/postProgramProcess',
        headers: {
          'X-cache-code': headerCode,
          'X-cache-id': headerId,
        },
        body: $variables.encryptedBody,
      });


      if (response?.body.p_err_code === "S") {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.p_err_msg,
          displayMode: 'transient',
          type: 'confirmation',
        });


        await Actions.callChain(context, {
          chain: 'searchAC',
        });

      } else {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.p_err_msg,
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
