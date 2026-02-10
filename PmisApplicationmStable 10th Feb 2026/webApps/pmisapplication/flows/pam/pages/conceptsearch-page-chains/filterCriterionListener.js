define([
  'vb/action/actionChain',
  'vb/action/actions'
], (ActionChain, Actions) => {
  'use strict';

  class filterCriterionListener extends ActionChain {

    async run(context, { event }) {
      const { $variables } = context;

      try {
        console.log("🔍 Smart Search Event:", JSON.stringify(event.value, null, 2));

        // 1️⃣ Reset searchObj
        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj']
        });

        // 2️⃣ Local collector
        let filters = {
          p_project_name: null,
          p_phase_name: null,
          p_milestone: null,
          p_consultant_name: null,
          p_keyword: null,
          p_planned_start_date: null,
          p_planned_end_date: null
        };

        // 3️⃣ Empty/reset scenario
        if (!event || !event.value) {
          await Actions.callChain(context, { chain: 'searchscheduleDetailsAction' });
          return;
        }
 
 console.log("+++++++++");
        // 4️⃣ Processor
        const processCriteria = (criteria) => {
          criteria.forEach(c => {
console.log("+++! " , c.$tag);
            switch (c.$tag) {
              case "ProjectFilter":
                filters.p_project_name = c.value?.p_project_name || "";
                console.log("+++1 PROJECT_NAME:", filters.p_project_name);
                break;

              case "PhaseFilter":
                filters.p_phase_name = c.value?. p_phase_name|| "";
                console.log("+++2 PHASE_NAME:", filters.p_phase_name);
                break;

              case "MilestoneFilter":
                filters.p_milestone = c.value?.p_milestone || "";
                console.log("+++3 MILESTONE:", filters.p_milestone);
                break;

              case "ConsultantFilter":
                filters.p_consultant_name = c.value?.p_consultant_name || "";
                console.log("+++4 CONSULTANT_NAME:", filters.p_consultant_name);
                break;

              case "DateRangeFilter":
                if (Array.isArray(c.criteria)) {
                  c.criteria.forEach(subCriteria => {
                    if (subCriteria.op === "$ge") {
                      filters.p_planned_start_date = subCriteria.value?.planned_start_date || null;
                      console.log("P_PLANNED_START_DATE:", filters.p_planned_start_date);
                    } else if (subCriteria.op === "$le") {
                      filters.p_planned_end_date = subCriteria.value?.planned_start_date || null;
                      console.log("P_PLANNED_END_DATE:", filters.p_planned_end_date);
                    }
                  });
                }
                break;

              case "$keyword$":
                filters.p_keyword = c.text?.trim() || null;
                break;
            }
          });
        };

        // 5️⃣ Root vs single
        if (event.value.$tag === "_root_") {
          processCriteria(event.value.criteria);
        } else {
          processCriteria([event.value]);
        }

        // 6️⃣ Map into searchObj
        $variables.searchObj.p_project_name = filters.p_project_name || "";
        $variables.searchObj.p_phase_name = filters.p_phase_name || "";
        $variables.searchObj.p_milestone = filters.p_milestone || "";
        $variables.searchObj.p_consultant_name = filters.p_consultant_name || "";
        $variables.searchObj.p_keyword = filters.p_keyword || "";
        $variables.searchObj.p_planned_start_date = filters.p_planned_start_date || "";
        $variables.searchObj.p_planned_end_date = filters.p_planned_end_date || "";

        console.log("📤 searchObj sent to backend:", JSON.stringify($variables.searchObj, null, 2));

        // 7️⃣ Trigger backend
        await Actions.callChain(context, {
          chain: 'searchscheduleDetailsAction'
        });

        console.log("✅ Smart Search applied successfully");

      } catch (e) {
        console.error("❌ filterCriterionListener error:", e);
      }
    }
  }

  return filterCriterionListener;
});