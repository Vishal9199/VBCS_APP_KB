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

  class searchAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;
      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchObj);

      $variables.encryptedBody.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'ScheduleProcess/postStgScheduleSyncSearch',
        body: $variables.encryptedBody,
      });

      if (response.body.OUT_STATUS === 'SUCCESS') {
        $variables.scheduleRequestADP.data = response.body.P_OUTPUT;

        $variables.pagination.prev = +$variables.searchObj.OFFSET > 0;
        $variables.pagination.next = response.body.OUT_HAS_NEXT === "Y";
      } else {

        // await Actions.fireNotificationEvent(context, {
        //   summary: response.body.OUT_DESCRIPTION,
        // });
        
      }
    }
  }

  return searchAC;
});
