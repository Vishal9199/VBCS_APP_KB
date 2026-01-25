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

  class loadHeaderAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.searchObj.SCHEDULE_ID = $variables.key;
console.log("=="+$variables.key);
      $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchObj);

      const response2 = await Actions.callRest(context, {
        endpoint: 'ScheduleProcess/postStgScheduleSyncSearch',
        body: $variables.encryptedBody,
      });

      if (response2.body.OUT_COUNT >= 1) {

        $variables.ScheduleSyncSearchVar = response2.body.P_OUTPUT[0];

        $variables.scheduled_id = response2.body.P_OUTPUT[0].schedule_id;

        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
          params: {
            'lv_header_id': $variables.key,
          },
        });
      }
      await Actions.resetDirtyDataStatus(context, {
      });
    }
  }

  return loadHeaderAC;
});
