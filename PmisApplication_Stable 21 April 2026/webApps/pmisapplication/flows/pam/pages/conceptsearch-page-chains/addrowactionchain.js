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

  class addrowactionchain extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.lvNextValue === 9999999999 || $variables.lvNextValue === undefined) {
        const arr = $variables.bufferDPTable.instance.lastIterator.mergedItemArray;

        if (!arr || arr.length === 0) {
          $page.variables.lvNextValue = -1;
        } else {
          const ids = arr.map(object => object.data.cs_dtl_id);
          const max = Math.max(...ids);
          $page.variables.lvNextValue = (max && max < 0) ? max - 1 : -1;
        }
      } else {
        $variables.lvNextValue = $variables.lvNextValue - 1;
      }

      const newRow = {
        cs_dtl_id: $variables.lvNextValue,
        object_version_num: 0,
        project_id: 0,
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
        created_date: new Date().toISOString(),
        last_updated_by: $application.user.email || 'CURRENT_USER',
        last_updated_date: new Date().toISOString(),
        last_updated_login: $application.user.email || 'CURRENT_USER',
      };

      await $page.variables.bufferDPTable.instance.addItem({
        metadata: { key: $variables.lvNextValue },
        data: newRow
      });

      // ── Fix: use rowKey (capital K), set property not whole object ──
      $page.variables.rowToEdit.rowKey = $variables.lvNextValue;
    }
  }

  return addrowactionchain;
});