// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (ActionChain, Actions, ActionUtils) => {
//   'use strict';

//   class qcBeforeRowEditChain extends ActionChain {
//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {any} params.rowKey
//      * @param {number} params.rowIndex
//      * @param {any} params.rowData
//      */
//     async run(context, { rowKey, rowIndex, rowData }) {
//       const { $page, $variables } = context;
//       $variables.qcCurrentRow = rowData;
//     }
//   }

//   return qcBeforeRowEditChain;
// });



define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class qcBeforeRowEditChain extends ActionChain {
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.rowKey
     * @param {number} params.rowIndex
     * @param {any} params.rowData
     */
    async run(context, { rowKey, rowIndex, rowData }) {
      const { $page, $variables } = context;

      // Parse all numeric fields — REST API returns numbers as strings,
      // which causes oj-input-number to throw a fatal type error.
      $variables.qcCurrentRow = {
        ...rowData,
        qc_total_month:     parseFloat(rowData.qc_total_month)     || 0,
        qc_satisfied_month: parseFloat(rowData.qc_satisfied_month) || 0,
        qc_failed_month:    parseFloat(rowData.qc_failed_month)    || 0,
        qc_total_cumm:      parseFloat(rowData.qc_total_cumm)      || 0,
        qc_satisfied_cumm:  parseFloat(rowData.qc_satisfied_cumm)  || 0,
        qc_total_failed:    parseFloat(rowData.qc_total_failed)    || 0,
        percent_failure:    parseFloat(rowData.percent_failure)    || 0
      };
    }
  }

  return qcBeforeRowEditChain;
});