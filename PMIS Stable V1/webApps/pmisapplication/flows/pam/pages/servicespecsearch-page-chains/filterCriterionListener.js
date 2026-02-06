define([
  'vb/action/actionChain',
  'vb/action/actions'
], (ActionChain, Actions) => {
  'use strict';

  class filterCriterionListener extends ActionChain {

    async run(context, { event }) {
      const { $variables } = context;

      try {
        console.log("🔔 Smart Search Event:", JSON.stringify(event.value, null, 2));

        // 1️⃣ Reset searchObj
        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj']
        });

        // 2️⃣ Local collector
        let filters = {
          p_keyword: null,
          p_spec_id: null,
          p_spec_num: null,
          p_tender_number: null,
          p_budget_number: null,
          p_status_id: null,
          p_from_date: null,
          p_to_date: null
        };

        // 3️⃣ Empty/reset scenario
        if (!event || !event.value) {
          $variables.searchObj.in_offset = '0';
          await Actions.callChain(context, { chain: 'vbAfterNavigateListener' });
          return;
        }

        // 4️⃣ Processor
        const processCriteria = (criteria) => {
          criteria.forEach(c => {

            switch (c.$tag) {

              case "ServiceSpecFilter":
                // VALUE = SERVICE_SPEC_ID
                filters.p_spec_num = c.value?.service_spec_num || "";
                console.log("+++1 SPEC_NUM: ", filters.service_spec_num);
                break;

              case "BudgetFilter":
                // VALUE = BUDGET_NUMBER
                filters.p_budget_number = c.value?.budget_number || "";
                console.log("+++2 BUDGET_NUMBER: ", filters.p_budget_number);
                break;

              case "TenderFilter":
                // VALUE = TENDER_NUMBER
                filters.p_tender_number = c.value?.tender_number || "";
                console.log("+++3 TENDER_NUMBER: ", filters.p_tender_number);
                break;

              case "StatusFilter":
                // VALUE = STATUS_ID
                filters.p_status_id = c.value?.status_id || "";
                console.log("+++4 STATUS_ID: ", filters.p_status_id);
                break;

              case "DateRangeFilter":
                if (Array.isArray(c.criteria)) {
                  c.criteria.forEach(subCriteria => {
                    if (subCriteria.op === "$ge") {
                      // Greater than or equal = FROM date
                      filters.p_from_date = subCriteria.value?.created_date || null;
                      console.log("P_FROM_DATE: ", filters.p_from_date);
                    } else if (subCriteria.op === "$le") {
                      // Less than or equal = TO date
                      filters.p_to_date = subCriteria.value?.created_date || null;
                      console.log("P_FROM_DATE: ", filters.p_from_date);
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
        $variables.searchObj.p_keyword = filters.p_keyword || "";
        $variables.searchObj.p_spec_id = filters.p_spec_id || "";
        $variables.searchObj.p_spec_num = filters.p_spec_num || "";
        $variables.searchObj.p_budget_number = filters.p_budget_number || "";
        $variables.searchObj.p_tender_number = filters.p_tender_number || "";
        $variables.searchObj.p_status_id = filters.p_status_id || "";
        $variables.searchObj.p_from_date = filters.p_from_date || "";
        $variables.searchObj.p_to_date = filters.p_to_date || "";

        // 7️⃣ Reset offset for fresh search
        $variables.searchObj.in_offset = '0';

        console.log("📤 searchObj sent to PL/SQL:", JSON.stringify($variables.searchObj, null, 2));

        // 8️⃣ Trigger backend
        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener'
        });

        console.log("✅ Smart Search applied successfully");

      } catch (e) {
        console.error("❌ filterCriterionListener error:", e);
      }
    }
  }

  return filterCriterionListener;
});