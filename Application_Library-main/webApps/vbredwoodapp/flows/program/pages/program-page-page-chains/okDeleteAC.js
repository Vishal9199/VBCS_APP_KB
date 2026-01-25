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

      let key = await Actions.callComponentMethod(context, {
        selector: '#deleteParameterDialog',
        method: 'getProperty',
        params: [
          'primaryKey',
        ],
      });

      const headerCode = await $application.functions.encryptJs($application.constants.secretKey, 'DELETE');

      const headerId = await $application.functions.encryptJs($application.constants.secretKey, key);

      $variables.parameterVar.last_updated_by = $application.user.fullName;
      $variables.parameterVar.last_updated_date = await $application.functions.getSysdate();
      $variables.parameterVar.last_updated_login = $application.user.fullName;

      $variables.parameterVar.effective_start_date = await $application.functions.normalizeDate($variables.parameterVar.effective_start_date);
      $variables.parameterVar.effective_end_date = await $application.functions.normalizeDate($variables.parameterVar.effective_end_date);

      $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.parameterVar);

      const response = await Actions.callRest(context, {
        endpoint: 'Program/postProgramParamProcess',
        headers: {
          'X-cache-code': headerCode,
          'X-cache-id': headerId,
        },
        body: $variables.encryptedBody,
      });

      if (response?.body.P_ERR_CODE === "S") {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'confirmation',
        });

        $variables.searchParameterObj.in_offset = 0;

        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
        });


        await Actions.resetVariables(context, {
          variables: [
            '$variables.parameterVar',
          ],
        });


      } else {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'persist',
          type: 'error',
        });
      }

      const deleteParameterDialogDialogClose = await Actions.callComponentMethod(context, {
        selector: '#deleteParameterDialog',
        method: 'close',
      });

    }
  }

  return okDeleteAC;
});
