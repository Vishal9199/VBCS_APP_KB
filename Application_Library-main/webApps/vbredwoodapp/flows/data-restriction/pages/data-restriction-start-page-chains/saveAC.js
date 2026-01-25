/* Copyright (c) 2024, Oracle and/or its affiliates */

define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class saveAC extends ActionChain {

    /**
     * Primary Save Action
     * @param {Object} context
     */
    async run(context) {
      const { $variables, $application, $functions } = context;
      // const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, '0');
      // const encryptJs2 = await $application.functions.encryptJs($application.constants.secretKey, 'POST');
      const encryptJs3 = await $application.functions.encryptJs($application.constants.secretKey, $variables.payload);

      $variables.encPayload.payload = encryptJs3;

      const response = await Actions.callRest(context, {
        endpoint: 'User/postNws_aolRestrictionProcess',
        headers: {
          'X-session-code': 'POST',
          'X-session-id': 0,
        },
        body: $variables.encPayload,
      });

      if (response.body.P_ERR_CODE === 'S') {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'confirmation',
        });

        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });

      } else {
         await Actions.fireNotificationEvent(context, {
           summary: response.body.P_ERR_MSG,
           displayMode: 'transient',
           type: 'error',
         });
      }

    }
  }

  return saveAC;
});
