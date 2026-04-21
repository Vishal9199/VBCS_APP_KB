define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class TableBeforeRowEditEndChain extends ActionChain {

    async run(context, { accept, event, rowData, rowKey, rowIndex }) {
      const { $page } = context;

      const currentRow = $page.variables.lvCurrentcashExpRow;

      const mergedRow = {
        // ✅ These are identity fields — keep rowData as source of truth
        cash_expectation_id: rowData?.cash_expectation_id ?? currentRow?.cash_expectation_id,
        object_version_num: rowData?.object_version_num ?? currentRow?.object_version_num,

        // ✅ These are edited by user via two-way binding — currentRow is live
        project_id: currentRow?.project_id ?? rowData?.project_id,
        project_name: currentRow?.project_name ?? rowData?.project_name,
        project_number: currentRow?.project_number ?? rowData?.project_number,
        region_name: currentRow?.region_name ?? rowData?.region_name,
        tender_number: currentRow?.tender_number ?? rowData?.tender_number,
        year: currentRow?.year ?? rowData?.year,
        type: currentRow?.type ?? rowData?.type,

        // ✅ Month fields — use currentRow (live), null is valid
        jan_curr_year: currentRow?.jan_curr_year,
        jan_next_year: currentRow?.jan_next_year,
        feb_curr_year: currentRow?.feb_curr_year,
        feb_next_year: currentRow?.feb_next_year,
        mar_curr_year: currentRow?.mar_curr_year,
        mar_next_year: currentRow?.mar_next_year,
        apr_curr_year: currentRow?.apr_curr_year,
        apr_next_year: currentRow?.apr_next_year,
        may_curr_year: currentRow?.may_curr_year,
        may_next_year: currentRow?.may_next_year,
        jun_curr_year: currentRow?.jun_curr_year,
        jun_next_year: currentRow?.jun_next_year,
        jul_curr_year: currentRow?.jul_curr_year,
        jul_next_year: currentRow?.jul_next_year,
        aug_curr_year: currentRow?.aug_curr_year,
        aug_next_year: currentRow?.aug_next_year,
        sep_curr_year: currentRow?.sep_curr_year,
        sep_next_year: currentRow?.sep_next_year,
        oct_curr_year: currentRow?.oct_curr_year,
        oct_next_year: currentRow?.oct_next_year,
        nov_curr_year: currentRow?.nov_curr_year,
        nov_next_year: currentRow?.nov_next_year,
        dec_curr_year: currentRow?.dec_curr_year,
        dec_next_year: currentRow?.dec_next_year,
        additional_info: currentRow?.additional_info,

        // ✅ Audit fields
        created_by: currentRow?.created_by ?? rowData?.created_by,
        created_date: currentRow?.created_date ?? rowData?.created_date,
        last_updated_by: currentRow?.last_updated_by ?? rowData?.last_updated_by,
        last_updated_date: currentRow?.last_updated_date ?? rowData?.last_updated_date,
        last_updated_login: currentRow?.last_updated_login ?? rowData?.last_updated_login,
      };

      // Validation
      if (!mergedRow.project_id) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Error: Project Name is required.',
          type: 'error',
          displayMode: 'transient',
        });
        accept(new Promise(() => { }));
        return;
      }

      if (!mergedRow.year) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Error: Year is required.',
          type: 'error',
          displayMode: 'transient',
        });
        accept(new Promise(() => { }));
        return;
      }

      $page.variables.count = ($page.variables.count || 0) + 1;

      await $page.variables.bufferDPcahExpTable.instance.updateItem({
        metadata: { key: rowKey },
        data: mergedRow,
      });
    }
  }

  return TableBeforeRowEditEndChain;
});