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

  class loadChildTableAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.lv_header_id
     */
    async run(context, { lv_header_id }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.searchValueObj.SCHEDULE_ID = lv_header_id;

      $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchValueObj);

      const response = await Actions.callRest(context, {
        endpoint: 'ScheduleProcess/postStgScheduleSyncParamSearch',
        body: $variables.encryptedBody,
      });

      $variables.paramADP.data = response.body.P_OUTPUT;

      $variables.pagination.prev = +$variables.searchValueObj.OFFSET > 0;
      $variables.pagination.next = response.body.OUT_HAS_NEXT === "Y";

      
    }
  }

  return loadChildTableAC;
});
