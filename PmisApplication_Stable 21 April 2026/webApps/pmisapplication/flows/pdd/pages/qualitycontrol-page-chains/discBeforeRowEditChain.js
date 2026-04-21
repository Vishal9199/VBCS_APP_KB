define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class discBeforeRowEditChain extends ActionChain {
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.rowKey
     * @param {number} params.rowIndex
     * @param {any} params.rowData
     */
    async run(context, { rowKey, rowIndex, rowData }) {
      const { $page, $variables } = context;

      // discCurrentRow is plain "object" — avoids VBCS type coercion.
      // disc_total_rfi, disc_approved_rfi, disc_rejected_rfi are "string"
      // in disciplineType (matches REST API). Keeping them as-is for oj-input-text.
      // Computed number fields are parsed here so oj-input-number gets real numbers.
      $variables.discCurrentRow = {
        ...rowData,
        disc_total_rfi_cumm:     parseFloat(rowData.disc_total_rfi_cumm)     || 0,
        disc_approved_rfi_cumm:  parseFloat(rowData.disc_approved_rfi_cumm)  || 0,
        disc_total_rfis:         parseFloat(rowData.disc_total_rfis)          || 0,
        percent_rejection:       parseFloat(rowData.percent_rejection)        || 0,
      };
    }
  }

  return discBeforeRowEditChain;
});