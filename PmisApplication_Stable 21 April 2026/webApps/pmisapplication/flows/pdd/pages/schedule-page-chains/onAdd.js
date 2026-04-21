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

  class onAdd extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Generate temporary negative ID for new row
      const newRowId = $variables.lvNextValue;
      $variables.lvNextValue = newRowId - 1;

      // Create new empty row with default values
      const newRow = {
        proj_schd_id: newRowId,
        object_version_num: 1,
        ora_project_id: $variables.projectId,
        tender_id: $variables.tenderId,
        milestone_id: null,
        milestone_code: null,
        project_milestone: null,
        planned_start_date: null,
        planned_end_date: null,
        revised_start_date: null,
        revised_end_date: null,
        actual_start_date: null,
        actual_end_date: null,
        comments: null,
        additional_info: null,
        created_by: $application.user.email,
        created_date: $application.functions.getSysdate(),
        last_updated_by: $application.user.email,
        last_updated_date: $application.functions.getSysdate(),
        last_updated_login: $application.user.email
      };

      // Add new row to BufferingDataProvider
      const addItem = await $page.variables.bufferDPSchedule.instance.addItem({
        metadata: {
          key: newRowId,
        },
        data: newRow,
      });

      console.log("onAdd - New row added:", JSON.stringify(newRow));
    }
  }

  return onAdd;
});