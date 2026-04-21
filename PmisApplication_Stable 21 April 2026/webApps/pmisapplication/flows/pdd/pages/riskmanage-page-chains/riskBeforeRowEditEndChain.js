// // define([
// //   'vb/action/actionChain',
// //   'vb/action/actions',
// //   'vb/action/actionUtils',
// // ], (ActionChain, Actions, ActionUtils) => {
// //   'use strict';

// //   class riskBeforeRowEditEndChain extends ActionChain {

// //     async run(context, { cancelEdit, rowKey, rowIndex, rowData, updatedRow }) {
// //       const { $page } = context;

// //       if (!cancelEdit) {
// //         await $page.variables.riskBufferDP.instance.updateItem({
// //           metadata: { key: rowKey },
// //           data: updatedRow,
// //         });
// //         console.log('riskBeforeRowEditEndChain: row updated in BDP, key=', rowKey);
// //       }
// //     }
// //   }

// //   return riskBeforeRowEditEndChain;
// // });


// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (ActionChain, Actions, ActionUtils) => {
//   'use strict';

//   class riskBeforeRowEditEndChain extends ActionChain {

//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {any}    params.cancelEdit
//      * @param {any}    params.rowKey
//      * @param {number} params.rowIndex
//      * @param {any}    params.rowData
//      * @param {Object} params.updatedRow  — equals $variables.lvCurrentRow
//      */
//     async run(context, { cancelEdit, rowKey, rowIndex, rowData, updatedRow }) {
//       const { $page } = context;

//       if (!cancelEdit) {

//         // ── Resolve label fields from pre-loaded ADP data ────────────────
//         // The select-single only updates the *_id field in lvCurrentRow.
//         // Navigation mode shows the label field (risk_category / likelihood / owner).
//         // We look up the matching item in the ADP and copy its label into the row.

//         const resolvedRow = { ...updatedRow };

//         // 1. Risk Category: risk_category_id → risk_category
//         if (resolvedRow.risk_category_id != null) {
//           const catData = $page.variables.ADPriskCategory.data || [];
//           const catItem = catData.find(item => item.value === resolvedRow.risk_category_id);
//           resolvedRow.risk_category = catItem ? catItem.label : (rowData.risk_category || '');
//         }

//         // 2. Likelihood: likelihood_id → likelihood
//         if (resolvedRow.likelihood_id != null) {
//           const lhData = $page.variables.ADPlikelihood.data || [];
//           const lhItem = lhData.find(item => item.value === resolvedRow.likelihood_id);
//           resolvedRow.likelihood = lhItem ? lhItem.label : (rowData.likelihood || '');
//         }

//         // 3. Owner: owner_id → owner
//         if (resolvedRow.owner_id != null) {
//           const ownerData = $page.variables.ADPowner.data || [];
//           const ownerItem = ownerData.find(item => item.value === resolvedRow.owner_id);
//           resolvedRow.owner = ownerItem ? ownerItem.label : (rowData.owner || '');
//         }

//         // ── Push resolved row into BufferingDataProvider ──────────────────
//         await $page.variables.riskBufferDP.instance.updateItem({
//           metadata: { key: rowKey },
//           data: resolvedRow,
//         });

//         console.log('riskBeforeRowEditEndChain: row updated in BDP, key=', rowKey);
//         console.log('riskBeforeRowEditEndChain: resolved labels →',
//           'risk_category:', resolvedRow.risk_category,
//           '| likelihood:', resolvedRow.likelihood,
//           '| owner:', resolvedRow.owner
//         );
//       }
//     }
//   }

//   return riskBeforeRowEditEndChain;
// });


define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class riskBeforeRowEditEndChain extends ActionChain {

    /**
     * Computes Strength and Overall Risk Rating from scope, time, cost, qhse.
     * Rules evaluated in priority order (most restrictive first):
     *
     *  Rule 1: all >= 4                                  → Severe,   Extreme
     *  Rule 2: any two = 5  AND  other two >= 3          → Severe,   Extreme
     *  Rule 3: any one >= 4  AND  any one < 3 (mixed)    → Major,    Extreme
     *  Rule 4: all = 3                                   → Major,    Extreme
     *  Rule 5: all <= 2  AND  any one < 2                → Minor,    Moderate
     *  Rule 6: all <= 3  AND  any one < 3                → Moderate, Major
     *  Default                                           → Minor,    Moderate
     *
     * Note: Rule 5 is checked before Rule 6 because all<=2 also satisfies all<=3.
     */
    computeStrengthAndRating(scope, time, cost, qhse) {
      const values  = [scope, time, cost, qhse].map(v => parseInt(v) || 0);
      const all     = (fn) => values.every(fn);
      const any     = (fn) => values.some(fn);
      const count   = (fn) => values.filter(fn).length;

      // Rule 1: all >= 4
      if (all(v => v >= 4)) {
        return { strength: 'Severe', overall_risk_rating: 'Extreme' };
      }

      // Rule 2: any two = 5 AND other two >= 3
      if (count(v => v === 5) >= 2 && all(v => v >= 3)) {
        return { strength: 'Severe', overall_risk_rating: 'Extreme' };
      }

      // Rule 3: any one >= 4 AND any one < 3 (high-low mix)
      if (any(v => v >= 4) && any(v => v < 3)) {
        return { strength: 'Major', overall_risk_rating: 'Extreme' };
      }

      // Rule 4: all = 3
      if (all(v => v === 3)) {
        return { strength: 'Major', overall_risk_rating: 'Extreme' };
      }

      // Rule 5: all <= 2 AND any one < 2 — checked BEFORE Rule 6
      // because all<=2 also satisfies all<=3, so Rule 6 would fire first otherwise
      if (all(v => v <= 2) && any(v => v < 2)) {
        return { strength: 'Minor', overall_risk_rating: 'Moderate' };
      }

      // Rule 6: all <= 3 AND any one < 3
      if (all(v => v <= 3) && any(v => v < 3)) {
        return { strength: 'Moderate', overall_risk_rating: 'Major' };
      }

      // Default fallback
      return { strength: 'Minor', overall_risk_rating: 'Moderate' };
    }

    async run(context, { cancelEdit, rowKey, rowIndex, rowData, updatedRow }) {
      const { $page } = context;

      if (!cancelEdit) {

        const resolvedRow = { ...updatedRow };

        // ── 1. Resolve LOV label fields ───────────────────────────────────

        // Risk Category: risk_category_id → risk_category
        if (resolvedRow.risk_category_id != null) {
          const catData = $page.variables.ADPriskCategory.data || [];
          const catItem = catData.find(item => item.value === resolvedRow.risk_category_id);
          resolvedRow.risk_category = catItem ? catItem.label : (rowData.risk_category || '');
        }

        // Likelihood: likelihood_id → likelihood
        if (resolvedRow.likelihood_id != null) {
          const lhData = $page.variables.ADPlikelihood.data || [];
          const lhItem = lhData.find(item => item.value === resolvedRow.likelihood_id);
          resolvedRow.likelihood = lhItem ? lhItem.label : (rowData.likelihood || '');
        }

        // Owner: owner_id → owner
        if (resolvedRow.owner_id != null) {
          const ownerData = $page.variables.ADPowner.data || [];
          const ownerItem = ownerData.find(item => item.value === resolvedRow.owner_id);
          resolvedRow.owner = ownerItem ? ownerItem.label : (rowData.owner || '');
        }

        // ── 2. Compute Strength & Overall Risk Rating ─────────────────────
        // Only calculate when at least one of the four impact fields is set.
        // If all four are null (new row, user hasn't set them yet), skip so
        // the fields don't show a misleading default.
        const s = resolvedRow.scope;
        const t = resolvedRow.time;
        const c = resolvedRow.cost;
        const q = resolvedRow.qhse;

        if (s != null || t != null || c != null || q != null) {
          const computed = this.computeStrengthAndRating(s, t, c, q);
          resolvedRow.strength            = computed.strength;
          resolvedRow.overall_risk_rating = computed.overall_risk_rating;

          console.log('riskBeforeRowEditEndChain: computed →',
            'scope:', s, '| time:', t, '| cost:', c, '| qhse:', q,
            '→ strength:', computed.strength,
            '| rating:', computed.overall_risk_rating
          );
        }

        // ── 3. Push resolved row into BufferingDataProvider ───────────────
        await $page.variables.riskBufferDP.instance.updateItem({
          metadata: { key: rowKey },
          data: resolvedRow,
        });

        console.log('riskBeforeRowEditEndChain: row updated in BDP, key=', rowKey);
        console.log('riskBeforeRowEditEndChain: resolved labels →',
          'risk_category:', resolvedRow.risk_category,
          '| likelihood:', resolvedRow.likelihood,
          '| owner:', resolvedRow.owner
        );
      }
    }
  }

  return riskBeforeRowEditEndChain;
});