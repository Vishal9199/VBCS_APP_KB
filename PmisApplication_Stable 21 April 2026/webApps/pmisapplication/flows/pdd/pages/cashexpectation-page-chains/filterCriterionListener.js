define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class filterCriterionListener extends ActionChain {

    async run(context, { event }) {
      const { $page } = context;  // ✅ only $page

      try {
        console.log("🔍 Filter Event ==> " + JSON.stringify(event.value));

        await Actions.resetVariables(context, {
          variables: ['$page.variables.searchObj'],
        });

        $page.variables.searchObj.in_offset = '0';
        $page.variables.searchObj.in_limit  = '10';

        let l_project_id   = null;
        let l_project_name = null;
        let l_year         = null;
        let l_keyword      = null;

        const processCriteria = (criteria) => {
          if (!criteria) return;

          if (criteria.$tag === "ProjectNameFilter" && criteria.value) {
            l_project_name = criteria.value.project_name ?? null;  // ✅ only project_name
          }

          if (criteria.$tag === "YearFilter" && criteria.value) {
            l_year = criteria.value.display_value ?? null;
          }

          if (criteria.$tag === "$keyword$" && (criteria.text || criteria.value)) {
            l_keyword = criteria.text || criteria.value || null;
          }
        };

        if (event.value) {
          if (event.value.$tag === "_root_") {
            event.value.criteria.forEach(processCriteria);
          } else {
            processCriteria(event.value);
          }
        }

        $page.variables.searchObj.p_project_id   = l_project_id   ? String(l_project_id) : "";
        $page.variables.searchObj.p_project_name = l_project_name || "";
        $page.variables.searchObj.p_year         = l_year         ? String(l_year)        : "";
        $page.variables.searchObj.p_keyword      = l_keyword      || "";

        console.log("✅ searchObj ==> " + JSON.stringify($page.variables.searchObj));

        await Actions.callChain(context, {
          chain: 'cashExpectationonLoad',
        });

      } catch (error) {
        console.error("❌ Filter Error:", error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Filter Error: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }
  }

  return filterCriterionListener;
});