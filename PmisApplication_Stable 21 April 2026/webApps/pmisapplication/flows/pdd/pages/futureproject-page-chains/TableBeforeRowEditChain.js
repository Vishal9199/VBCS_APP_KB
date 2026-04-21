define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class TableBeforeRowEditChain extends ActionChain {

    async run(context, { rowKey, rowIndex, rowData }) {
      const { $variables } = context;

      // Use full object replacement (spread syntax) — avoids VBCS nested property
      // assignment bug. lvCurrentRow is typed 'object' so no schema coercion.
      $variables.lvCurrentRow = {
        ...rowData,
        future_project_id:  parseInt(rowData.future_project_id)  || null,
        object_version_num: parseInt(rowData.object_version_num) || 1,
        senior_mgr_usr_id:  parseInt(rowData.senior_mgr_usr_id)  || null,
        project_mgr_id:     parseInt(rowData.project_mgr_id)     || null,
        region_id:          parseInt(rowData.region_id)          || null,
        estimated_cost:     parseFloat(rowData.estimated_cost)   || null,
        year:               parseInt(rowData.year)               || null,
        // year:               rowData.year ? String(rowData.year) : null,
        january:            parseFloat(rowData.january)          || null,
        february:           parseFloat(rowData.february)         || null,
        march:              parseFloat(rowData.march)            || null,
        april:              parseFloat(rowData.april)            || null,
        may:                parseFloat(rowData.may)              || null,
        june:               parseFloat(rowData.june)             || null,
        july:               parseFloat(rowData.july)             || null,
        august:             parseFloat(rowData.august)           || null,
        september:          parseFloat(rowData.september)        || null,
        october:            parseFloat(rowData.october)          || null,
        november:           parseFloat(rowData.november)         || null,
        december:           parseFloat(rowData.december)         || null,
        jan_actual:         parseFloat(rowData.jan_actual)       || null,
        feb_actual:         parseFloat(rowData.feb_actual)       || null,
        mar_actual:         parseFloat(rowData.mar_actual)       || null,
        apr_actual:         parseFloat(rowData.apr_actual)       || null,
        may_actual:         parseFloat(rowData.may_actual)       || null,
        jun_actual:         parseFloat(rowData.jun_actual)       || null,
        jul_actual:         parseFloat(rowData.jul_actual)       || null,
        aug_actual:         parseFloat(rowData.aug_actual)       || null,
        sep_actual:         parseFloat(rowData.sep_actual)       || null,
        oct_actual:         parseFloat(rowData.oct_actual)       || null,
        nov_actual:         parseFloat(rowData.nov_actual)       || null,
        dec_actual:         parseFloat(rowData.dec_actual)       || null,
      };

      console.log('TableBeforeRowEditChain: row loaded, key=', rowKey);
    }
  }

  return TableBeforeRowEditChain;
});