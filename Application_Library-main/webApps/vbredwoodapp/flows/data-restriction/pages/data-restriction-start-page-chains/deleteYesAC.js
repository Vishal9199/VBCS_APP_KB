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
        selector: '#delete_dialog',
        method: 'getProperty',
        params: ['key'],
      });

      // const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, key);

      // const encryptJs2 = await $application.functions.encryptJs($application.constants.secretKey, 'DELETE');

      const encryptJs3 = await $application.functions.encryptJs($application.constants.secretKey, $variables.deletePayload);

      let wrapPayload = {
        "payload": encryptJs3
      }

      const response = await Actions.callRest(context, {
        endpoint: 'User/postNws_aolRestrictionProcess',
        headers: {
          'X-session-id': key,
          'X-session-code': 'DELETE',
        },
        body: wrapPayload,
      });

      if (response.body.p_err_code === 'S') {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.p_err_msg,
          type: 'confirmation',
        });
      }

      await Actions.callChain(context, {
        chain: 'vbEnterListener',
      });

      const deleteDialogClose = await Actions.callComponentMethod(context, {
        selector: '#delete_dialog',
        method: 'close',
      });
    }
  }

  return deleteYesAC;
});