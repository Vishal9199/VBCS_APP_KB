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

      $variables.encryptObj.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'SynProcessLog/postStgScheduleSyncList',
        body: $variables.encryptObj,
      });

      if (response.body.OUT_STATUS === 'SUCCESS') {
        $variables.adpTable.data = response.body.P_OUTPUT;
      } else {

        // await Actions.fireNotificationEvent(context, {
        //   summary: response.body.OUT_DESCRIPTION,
        // });
        
      }
    }
  }

  return searchAC;
});
