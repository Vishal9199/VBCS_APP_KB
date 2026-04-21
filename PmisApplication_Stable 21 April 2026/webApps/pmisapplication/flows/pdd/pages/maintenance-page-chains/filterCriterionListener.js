define([
  'vb/action/actionChain',
  'vb/action/actions'
], (ActionChain, Actions) => {
  'use strict';

  class filterCriterionListener extends ActionChain {

    async run(context, { event }) {
      const { $variables, $tag, $keyword } = context;

      try {
        console.log("🔍 Smart Search Event:", JSON.stringify(event.value, null, 2));

        // 1️⃣ Reset searchObj
        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj']
        });

        // 2️⃣ Local collector
        let filters = {
          p_project_number: null,
          p_tender_number: null,
          p_tender_name: null,
          p_keyword: null
        };

        // 3️⃣ Empty/reset scenario
        if (!event || !event.value) {
          await Actions.callChain(context, {
            chain: 'vbEnterListener',
          });
          return;
        }

        console.log("+++++++++");

        // 4️⃣ Processor
        const processCriteria = (criteria) => {
          criteria.forEach(c => {
            console.log("+++! ", c.$tag);
            switch (c.$tag) {

              case "TenderNumberFilter":
                filters.p_tender_number = c.value?.p_tender_number || "";
                console.log("+++1 TENDER_NUMBER:", filters.p_tender_number);
                break;

              case "TenderNameFilter":
                filters.p_tender_name = c.value?.p_tender_name || "";
                console.log("+++2 TENDER_NAME:", filters.p_tender_name);
                break;

              case "ProjectNumberFilter":
                filters.p_project_number = c.value?.p_project_number || "";
                console.log("+++3 PROJECT_NUMBER:", filters.p_project_number);
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
        $variables.searchObj.p_project_number = filters.p_project_number || "";
        $variables.searchObj.p_tender_number  = filters.p_tender_number  || "";
        $variables.searchObj.p_tender_name    = filters.p_tender_name    || "";
        $variables.searchObj.p_keyword        = filters.p_keyword        || "";

        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });

        console.log("📤 searchObj sent to backend:", JSON.stringify($variables.searchObj, null, 2));

        console.log("✅ Smart Search applied successfully");

      } catch (e) {
        console.error("❌ filterCriterionListener error:", e);
      }
    }
  }

  return filterCriterionListener;
});