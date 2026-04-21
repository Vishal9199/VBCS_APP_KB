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

  class BudgetBeforeRowEditEndChain extends ActionChain {

    /**
     * Fires when a table row exits edit mode.
     *
     * Steps:
     * 1. If cancelled, do nothing.
     * 2. Commit the edited row (PLAN_MONTHLY or ACTUAL/FORECAST) into the buffer.
     * 3. Fetch all current rows from the buffer (including already-buffered edits).
     * 4. Recalculate all 7 derived rows per the business rules.
     * 5. Write back each derived row via updateItem.
     *
     * Business Rules:
     *   PLAN_MONTHLY                   - Manually enterable
     *   BASELINE                       - Running cumulative sum of Plan Monthly up to each month
     *   ACTUAL/FORECAST                - Manually enterable
     *   CUMM_ACTUAL/FORECAST           - Running cumulative sum of Actual/Forecast
     *   CUMM_DIFFERENCE                - Cumm Actual/Forecast minus Baseline (per month)
     *   PLAN_VOWD_PROGRESS_%           - (Plan Monthly / Anticipated Value) * 100
     *   BASELINE_VOWD_PROGRESS_%       - (Baseline / Anticipated Value) * 100
     *   ACT_/_FORECAST_VOWD_PROG       - (Actual/Forecast / Anticipated Value) * 100
     *   CUMM_ACT_/_FORECAST_VOWD_PROG  - (Cumm Actual/Forecast / Anticipated Value) * 100
     *
     * @param {Object} context
     * @param {Object} params
     * @param {boolean} params.cancelEdit
     * @param {any}     params.rowKey
     * @param {number}  params.rowIndex
     * @param {any}     params.rowData
     * @param {BudgetLineCurrentRowType} params.updatedRow
     */
    async run(context, { cancelEdit, rowKey, rowIndex, rowData, updatedRow }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // If user pressed Escape / cancelled, do nothing
      if (cancelEdit) return;

      // ── STEP 1: Only process editable rows ───────────────────────────
      const editableRows = ['PLAN_MONTHLY', 'ACTUAL/FORECAST'];
      if (!editableRows.includes(updatedRow.meaning_code)) {
        console.log('BudgetBeforeRowEditEnd - Skipping non-editable row:', updatedRow.meaning_code);
        return;
      }

      // ── STEP 2: Commit the edited row back into the buffer ────────────
      // Also recalculate total_curr_year for the editable row itself
      const editedRowWithTotal = { ...updatedRow };
      editedRowWithTotal.total_curr_year = Math.round(
        ['january','february','march','april','may','june','july','august','september','october','november','december']
          .reduce((sum, m) => sum + (editedRowWithTotal[m] == null || isNaN(Number(editedRowWithTotal[m])) ? 0 : Number(editedRowWithTotal[m])), 0)
        * 1000) / 1000;

      await $page.variables.bufferDPBudgetLines.instance.updateItem({
        metadata: { key: rowKey },
        data: editedRowWithTotal,
      });

      console.log('BudgetBeforeRowEditEnd - Committed row key:', rowKey, '| meaning_code:', updatedRow.meaning_code, '| total_curr_year:', editedRowWithTotal.total_curr_year);

      // ── STEP 3: Fetch all rows from the underlying ADP ───────────────
      // Use budgetLinesADP (underlying ArrayDataProvider) for current persisted data
      const allRows = $page.variables.budgetLinesADP.data
        ? [...$page.variables.budgetLinesADP.data]
        : [];

      if (allRows.length === 0) {
        console.warn('BudgetBeforeRowEditEnd - No rows found in ADP');
        return;
      }

      // Build a map: meaning_code -> row data (start from ADP snapshot)
      const rowMap = {};
      allRows.forEach(row => {
        rowMap[row.meaning_code] = { ...row };
      });

      // Overlay any pending buffer edits (including the one we just committed)
      const dp = $page.variables.bufferDPBudgetLines.instance;
      const submittableItems = await dp.getSubmittableItems();
      submittableItems.forEach(item => {
        if (item.operation === 'update' && item.item && item.item.data) {
          rowMap[item.item.data.meaning_code] = { ...item.item.data };
        }
      });
      // Ensure the just-committed row (with corrected total) is in the map
      rowMap[editedRowWithTotal.meaning_code] = { ...editedRowWithTotal };

      // ── STEP 4: Get Anticipated Value from header ─────────────────────
      const anticipatedValue = $variables.postBudgetHdrVar
        ? Number($variables.postBudgetHdrVar.anticipated_contract || 0)
        : 0;

      console.log('BudgetBeforeRowEditEnd - anticipated_contract:', anticipatedValue);

      // ── STEP 5: Month keys in order ───────────────────────────────────
      const months = [
        'january', 'february', 'march', 'april',
        'may', 'june', 'july', 'august',
        'september', 'october', 'november', 'december'
      ];

      // Helper: safe number, null-safe
      const num = (v) => (v == null || isNaN(Number(v))) ? 0 : Number(v);
      // Helper: round to 3 decimal places
      const round3 = (v) => Math.round(v * 1000) / 1000;

      // ── STEP 6: Source the two manually-editable rows ─────────────────
      const planMonthlyRow = rowMap['PLAN_MONTHLY']   || {};
      const actForecastRow = rowMap['ACTUAL/FORECAST'] || {};

      // ── STEP 7: Calculate derived values per month ────────────────────
      const baselineValues            = {};
      const cummActForecastValues     = {};
      const cummDifferenceValues      = {};
      const planVowdValues            = {};
      const baselineVowdValues        = {};
      const actForecastVowdValues     = {};
      const cummActForecastVowdValues = {};

      let runningBaseline        = 0;
      let runningCummActForecast = 0;

      months.forEach(month => {
        const planMonthly = num(planMonthlyRow[month]);
        const actForecast = num(actForecastRow[month]);

        // Baseline = cumulative sum of Plan Monthly
        runningBaseline       += planMonthly;
        baselineValues[month]  = round3(runningBaseline);

        // Cumm Actual/Forecast = cumulative sum of Actual/Forecast
        runningCummActForecast        += actForecast;
        cummActForecastValues[month]   = round3(runningCummActForecast);

        // Cumm Difference = Cumm Actual/Forecast - Baseline
        cummDifferenceValues[month] = round3(cummActForecastValues[month] - baselineValues[month]);

        // VOWD % calculations
        if (anticipatedValue !== 0) {
          planVowdValues[month]            = round3((planMonthly / anticipatedValue) * 100);
          baselineVowdValues[month]        = round3((baselineValues[month] / anticipatedValue) * 100);
          actForecastVowdValues[month]     = round3((actForecast / anticipatedValue) * 100);
          cummActForecastVowdValues[month] = round3((cummActForecastValues[month] / anticipatedValue) * 100);
        } else {
          planVowdValues[month]            = 0;
          baselineVowdValues[month]        = 0;
          actForecastVowdValues[month]     = 0;
          cummActForecastVowdValues[month] = 0;
        }
      });

      console.log('BudgetBeforeRowEditEnd - Baseline:', JSON.stringify(baselineValues));
      console.log('BudgetBeforeRowEditEnd - Cumm Act/Forecast:', JSON.stringify(cummActForecastValues));

      // ── STEP 8: Build a patched row from existing data + new calc values
      const buildUpdatedRow = (existingRow, calcValues) => {
        const updated = { ...existingRow };
        months.forEach(month => {
          updated[month] = calcValues[month];
        });
        // Recalculate total_curr_year as sum of all 12 months
        updated.total_curr_year = round3(months.reduce((sum, month) => sum + num(calcValues[month]), 0));
        return updated;
      };

      // ── STEP 9: Write back each derived row via updateItem ────────────
      const derivedUpdates = [
        { code: 'BASELINE',                       values: baselineValues },
        { code: 'CUMM_ACTUAL/FORECAST',           values: cummActForecastValues },
        { code: 'CUMM_DIFFERENCE',                values: cummDifferenceValues },
        { code: 'PLAN_VOWD_PROGRESS_%',           values: planVowdValues },
        { code: 'BASELINE_VOWD_PROGRESS_%',       values: baselineVowdValues },
        { code: 'ACT_/_FORECAST_VOWD_PROG',       values: actForecastVowdValues },
        { code: 'CUMM_ACT_/_FORECAST_VOWD_PROG',  values: cummActForecastVowdValues },
      ];

      for (const derivedUpdate of derivedUpdates) {
        const existingRow = rowMap[derivedUpdate.code];
        if (!existingRow || !existingRow.budget_control_line_id) {
          console.warn('BudgetBeforeRowEditEnd - Row not found for meaning_code:', derivedUpdate.code);
          continue;
        }
        const updatedDerivedRow = buildUpdatedRow(existingRow, derivedUpdate.values);
        await $page.variables.bufferDPBudgetLines.instance.updateItem({
          metadata: { key: existingRow.budget_control_line_id },
          data: updatedDerivedRow,
        });
        console.log('BudgetBeforeRowEditEnd - Updated derived row:', derivedUpdate.code);
      }

      console.log('BudgetBeforeRowEditEnd - All derived rows recalculated successfully.');
    }
  }

  return BudgetBeforeRowEditEndChain;
});