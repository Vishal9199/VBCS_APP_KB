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

  class onAddRow extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $variables } = context;

      console.log("➕ Adding new blank row to table");

      // Generate temporary negative ID for new row
      const newRowId = $variables.lvNextValue;
      $variables.lvNextValue = newRowId - 1; // Decrement for next new row

      // Create new blank row object
      const newRow = {
        cs_dtl_id: newRowId, // Temporary negative ID
        object_version_num: 0,
        project_id: null,
        project_name: "",
        phase_id: null,
        phase_name: "",
        milestone_id: null,
        milestone: "",
        cs_senior_mgr_id: null,
        senior_manager_name: "",
        cs_planning_mgr_id: null,
        planning_manager_name: "",
        consultant_id: null,
        consultant_name: "",
        budget_amount: null,
        planned_start_date: null,
        planned_end_date: null,
        revised_start_date: null,
        revised_end_date: null,
        actual_start_date: null,
        actual_end_date: null,
        completion_percentage: null,
        remarks: "",
        created_by: $application.user.email || 'CURRENT_USER',
        creation_date: new Date().toISOString(),
        last_updated_by: $application.user.email || 'CURRENT_USER',
        last_update_date: new Date().toISOString()
      };

      console.log("📝 New blank row created:", newRow);

      // Add the new row to BufferingDataProvider
      $variables.bufferDPTable.addItem({
        metadata: { key: newRowId },
        data: newRow
      });

      console.log("✅ New row added to table with ID:", newRowId);

      // Show notification
      await Actions.fireNotificationEvent(context, {
        summary: 'New Row Added',
        message: 'Click Edit icon to enter data',
        type: 'info',
        displayMode: 'transient',
      });
    }
  }

  return onAddRow;
});