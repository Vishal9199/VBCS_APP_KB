define([
  'vb/action/actionChain',
  'vb/action/actions',
], (ActionChain, Actions) => {
  'use strict';

  class onDiscValueChange extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.event
     * @param {any} params.current
     * @param {number} params.index
     * @param {any} params.key
     * @param {any} params.originalEvent
     */
    async run(context, { event, current, index, key, originalEvent }) {
      const { $page } = context;

      // Only run if value actually changed
      if (event.detail.previousValue === event.detail.value) {
        return;
      }

      const row = $page.variables.discCurrentRow;

      // Read editable fields — these are strings from oj-input-text
      let totalRfi    = parseFloat(row.disc_total_rfi)    || 0;
      let approvedRfi = parseFloat(row.disc_approved_rfi) || 0;
      let rejectedRfi = parseFloat(row.disc_rejected_rfi) || 0;

      // Discipline Total Cumulative (T) — varies by discipline type
      // Electrical, Mechanical, SCADA → T = Total RFI
      // Structural / Civil            → T = Total RFI + 32
      // Other                         → T = Total RFI + 44
      const disciplineType = (row.discipline_type || '').toLowerCase().trim();

      let totalCumm = totalRfi; // default: Electrical, Mechanical, SCADA

      if (disciplineType.includes('structural') || disciplineType.includes('civil')) {
        totalCumm = totalRfi + 32;
      } else if (disciplineType.includes('other')) {
        totalCumm = totalRfi + 44;
      }

      // Approved Discipline Cumulative = Approved RFI (all disciplines)
      let approvedCumm = approvedRfi;

      // Rejected Cumulative (R) = Rejected RFI (all disciplines)
      let rejectedCumm = rejectedRfi;

      // % Rejection = (R / T) * 100
      let percentRejection = 0;
      if (totalCumm > 0) {
        percentRejection = (rejectedCumm / totalCumm) * 100;
      }

      // Assign computed values back to discCurrentRow
      $page.variables.discCurrentRow.disc_total_rfi_cumm    = totalCumm;
      $page.variables.discCurrentRow.disc_approved_rfi_cumm = approvedCumm;
      $page.variables.discCurrentRow.disc_total_rfis        = rejectedCumm;
      $page.variables.discCurrentRow.percent_rejection      = Math.round(percentRejection * 100) / 100;
    }

  }

  return onDiscValueChange;
});