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

  class vbEnterListener extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // // Load milestone lookup data
      // await Actions.callChain(context, {
      //   chain: 'loadMilestones',
      // });

      // let temp_key = await Actions.callChain(context, {
      //   chain: 'application:encryptAC',
      //   params: {
      //     input: $variables.pTenderId,
      //   },
      // });

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
        headers: {
          'x-session-id': $variables.pTenderId,
        },
      });

      $variables.headerDtls.projectName = response.body.items[0].project_name;
      $variables.headerDtls.projectNumber = response.body.items[0].project_number;
      $variables.headerDtls.tenderNumber = response.body.items[0].tender_number;
      $variables.projectId = response.body.items[0].project_id;
      $variables.tenderId = response.body.items[0].tender_id;

      const response2 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddScheduleLovMilestone',
      });

      $variables.fetchedMilestoneListADP.data = response2.body.items;
      

      // Load schedule data
      await Actions.callChain(context, {
        chain: 'SynScheduleADP',
      });

      // Setup BufferingDataProvider event listener for change tracking
      const addEventListener = await $page.variables.bufferDPSchedule.instance.addEventListener('submittableChange', (event) => {
        // BufferingDataProvider fires the "submittableChange" event whenever there 
        // is a change in the number of submittable items.
        // We can use this to update the UI.
        const submittableRows = event.detail;
        const textarea = document.getElementById("bufferContent");
        let textValue = "";
        submittableRows.forEach((editItem) => {
          textValue += "Operation: " + editItem.operation + ", ";
          textValue += "Row ID: " + (editItem.item.data.proj_schd_id || 'NEW');
          if (editItem.item.metadata.message) {
            textValue += " error: " + JSON.stringify(editItem.item.metadata.message);
          }
          textValue += "\n";
        });
        textarea.value = textValue;
      });
    }
  }

  return vbEnterListener;
});