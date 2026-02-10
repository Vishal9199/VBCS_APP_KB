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

  class TableBeforeRowEditChain extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $variables } = context;

      // Get parameters
      const rowKey = context.params.rowKey;
      const rowIndex = context.params.rowIndex;
      const rowData = context.params.rowData;

      console.log("🔵 TableBeforeRowEdit - Row Key:", rowKey);
      console.log("🔵 TableBeforeRowEdit - Row Data:", rowData);

      // Store current row data in lvCurrentRow variable for editing
      $variables.lvCurrentRow = {
        cs_dtl_id: rowData.cs_dtl_id,
        object_version_num: rowData.object_version_num,
        project_id: rowData.project_id,
        project_name: rowData.project_name,
        phase_id: rowData.phase_id,
        phase_name: rowData.phase_name,
        milestone_id: rowData.milestone_id,
        milestone: rowData.milestone,
        cs_senior_mgr_id: rowData.cs_senior_mgr_id,
        senior_manager_name: rowData.senior_manager_name,
        cs_planning_mgr_id: rowData.cs_planning_mgr_id,
        planning_manager_name: rowData.planning_manager_name,
        consultant_id: rowData.consultant_id,
        consultant_name: rowData.consultant_name,
        budget_amount: rowData.budget_amount,
        planned_start_date: rowData.planned_start_date,
        planned_end_date: rowData.planned_end_date,
        revised_start_date: rowData.revised_start_date,
        revised_end_date: rowData.revised_end_date,
        actual_start_date: rowData.actual_start_date,
        actual_end_date: rowData.actual_end_date,
        completion_percentage: rowData.completion_percentage,
        remarks: rowData.remarks,
        created_by: rowData.created_by,
        creation_date: rowData.creation_date,
        last_updated_by: rowData.last_updated_by,
        last_update_date: rowData.last_update_date
      };

      console.log("✅ lvCurrentRow populated:", $variables.lvCurrentRow);
    }
  }

  return TableBeforeRowEditChain;
});