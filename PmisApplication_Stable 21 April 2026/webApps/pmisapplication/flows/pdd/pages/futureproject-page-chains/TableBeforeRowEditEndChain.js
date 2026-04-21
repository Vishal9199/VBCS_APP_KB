define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class TableBeforeRowEditEndChain extends ActionChain {

    sanitizeDate(value) {
      if (!value) return null;
      return String(value).substring(0, 10);
    }

    async run(context, { cancelEdit, rowKey, rowIndex, rowData, updatedRow }) {
      const { $page, $variables } = context;

      if (!cancelEdit) {

        // KEY FIX: updatedRow = snapshot at edit-start (original values, NOT edited).
        // $variables.lvCurrentRow holds all user-edited values from the {{ }} bindings.
        // Spread rowData first (preserves read-only fields), then lvCurrentRow on top
        // (edited values override originals).
        const resolvedRow = { ...rowData, ...$variables.lvCurrentRow };

        // Sanitize date fields — strip time portion to prevent ORA-01830
        resolvedRow.estimated_start_date = this.sanitizeDate(resolvedRow.estimated_start_date);
        resolvedRow.estimated_end_date   = this.sanitizeDate(resolvedRow.estimated_end_date);

        // Resolve senior_manager label from pre-loaded ADP
        if (resolvedRow.senior_mgr_usr_id != null) {
          const smData = $page.variables.ADPseniorManager.data || [];
          const smItem = smData.find(item => item.user_id === resolvedRow.senior_mgr_usr_id);
          resolvedRow.senior_manager = smItem
            ? (smItem.person_full_name || smItem.user_name)
            : (rowData.senior_manager || '');
        }

        // Resolve project_manager label from pre-loaded ADP
        if (resolvedRow.project_mgr_id != null) {
          const pmData = $page.variables.ADPprojectManager.data || [];
          const pmItem = pmData.find(item => item.user_id === resolvedRow.project_mgr_id);
          resolvedRow.project_manager = pmItem
            ? (pmItem.person_full_name || pmItem.user_name)
            : (rowData.project_manager || '');
        }

        // Resolve region fields from pre-loaded ADP
        // region_id stores lookup_value_id (numeric) — find matching item by ID
        if (resolvedRow.region_id != null) {
          const rgData = $page.variables.ADPregion.data || [];
          const rgItem = rgData.find(item => item.lookup_value_id === resolvedRow.region_id);
          if (rgItem) {
            resolvedRow.region_name = rgItem.lookup_value_name;
            resolvedRow.region_code = rgItem.lookup_value_code;
          } else {
            resolvedRow.region_name = rowData.region_name || '';
            resolvedRow.region_code = rowData.region_code || '';
          }
        }

        await $page.variables.futureProjectBDP.instance.updateItem({
          metadata: { key: rowKey },
          data: resolvedRow,
        });

        console.log('TableBeforeRowEditEndChain: BDP updated, key=', rowKey);
        console.log('Resolved row =>', JSON.stringify(resolvedRow));
      }
    }
  }

  return TableBeforeRowEditEndChain;
});