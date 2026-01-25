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

  class vbAfterNavigateListener extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{previousPage:string,previousPageParams:any,currentPage:string,currentPageParams:any}} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;


      const response = await Actions.callRest(context, {
        endpoint: 'SyncSetup/postStgScheduleSetupSearch',
      });

      if (response.body.OUT_TOTAL_COUNT === 1) {
        $variables.dataExist = true;

        $variables.saveFlag = true;
        $variables.method = 'PUT';

        $variables.postStgScheduleSetupSearchVar = response.body.P_OUTPUT[0];

        if (response.body.P_OUTPUT[0].mail_notification === 'Y') {
          $variables.mailSwitchVar = true;
        } else {
          $variables.mailSwitchVar = false;
        }
      } else {

        $variables.dataExist = false;
        $variables.method = 'POST';
      }
    }
  }

  return vbAfterNavigateListener;
});
