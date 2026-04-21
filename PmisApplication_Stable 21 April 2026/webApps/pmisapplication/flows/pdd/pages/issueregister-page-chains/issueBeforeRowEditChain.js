define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class issueBeforeRowEditChain extends ActionChain {

    async run(context, { rowKey, rowIndex, rowData }) {
      const { $variables } = context;

      // lvCurrentRow MUST be plain "object" type (set in page.json).
      // This prevents VBCS type coercion — oj-select-single requires real
      // numbers for value binding; typed variables coerce them to strings.
      $variables.lvCurrentRow = {
        ...rowData,
        // Parse all number fields to ensure proper types
        issue_id:            parseInt(rowData.issue_id)            || null,
        object_version_num:  parseInt(rowData.object_version_num)  || 1,
        ora_project_id:      parseInt(rowData.ora_project_id)      || null,
        tender_id:           parseInt(rowData.tender_id)           || null,
        issue_number:        parseInt(rowData.issue_number)        || null,
        scope:               parseInt(rowData.scope)               || null,
        time:                parseInt(rowData.time)                || null,
        cost:                parseInt(rowData.cost)                || null,
        qhse:                parseInt(rowData.qhse)                || null,
        total_score:         parseInt(rowData.total_score)         || 0,
        progress:            parseInt(rowData.progress)            || null,
      };

      console.log('issueBeforeRowEditChain: row loaded, key=', rowKey);
    }
  }

  return issueBeforeRowEditChain;
});