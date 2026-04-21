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

  class SynScheduleADP extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Set search parameters
        $variables.searchObj.p_project_id = $variables.projectId;
        $variables.searchObj.p_tender_id = $variables.tenderId;

        console.log("SynScheduleADP - Search parameters:", JSON.stringify($variables.searchObj));

        let temp_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.searchObj,
          },
        });

        // Call REST service to get schedule data
        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddScheduleSearch',
          body: {"payload": temp_payload},
        });

        console.log("SynScheduleADP - Response:", JSON.stringify(response.body));

        // Check response status and populate data
        if (response.body.OUT_STATUS === 'SUCCESS' && response.body.OUT_COUNT >= 1) {
          $variables.scheduleADP.data = response.body.P_OUTPUT;
          
          console.log("SynScheduleADP - Loaded records:", response.body.OUT_COUNT);

          // await Actions.fireNotificationEvent(context, {
          //   summary: 'Data Loaded',
          //   message: `Loaded ${response.body.OUT_COUNT} schedule record(s)`,
          //   type: 'info',
          //   displayMode: 'transient'
          // });

        } else if (response.body.OUT_COUNT === 0) {
          // No records found - initialize with empty array
          $variables.scheduleADP.data = [];
          
          console.log("SynScheduleADP - No records found");

          await Actions.fireNotificationEvent(context, {
            summary: 'No Data',
            message: 'No schedule records found for this project',
            type: 'info',
            displayMode: 'transient'
          });

        } else {
          // Error response
          console.error("SynScheduleADP - Error:", response.body.OUT_DESCRIPTION);

          await Actions.fireNotificationEvent(context, {
            summary: 'Data Load Failed',
            message: response.body.OUT_DESCRIPTION || 'Failed to load schedule data',
            type: 'error',
            displayMode: 'persist'
          });
        }

      } catch (error) {
        console.error("SynScheduleADP - Exception:", error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Error Loading Data',
          message: 'An error occurred while loading schedule data: ' + error.message,
          type: 'error',
          displayMode: 'persist'
        });
      }
    }
  }

  return SynScheduleADP;
});