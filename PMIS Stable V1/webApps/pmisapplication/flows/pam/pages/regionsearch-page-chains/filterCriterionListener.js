define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class filterCriterionListener extends ActionChain {
    
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{}} params.event
     */
    async run(context, { event }) {
      const { $page, $variables } = context;

      try {
        console.log("==> Filter Event:", JSON.stringify(event.value));

        // ✅ STEP 1: Reset searchObj for clean state
        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj'],
        });

        // ✅ STEP 2: Initialize filter collection (lowercase to match PL/SQL)
        let filters = {
          p_region_id: null,
          p_region_name: null,
          p_project_id: null,
          p_project_number: null,
          p_tender_number: null,
          p_tender_name: null,
          p_responsible_person: null,
          p_person_id: null,
          p_created_by: null,
          p_keyword: null
        };

        // ✅ STEP 3: Handle empty/reset scenario
        if (!event || !event.value) {
          console.log("No event value - resetting filters");
          
          // Reset offset and trigger search with empty filters
          $variables.searchObj.in_offset = '0';
          
          await Actions.callChain(context, {
            chain: 'vbAfterNavigateListener',
          });
          
          return; // Exit early
        }

        // ✅ STEP 4: Define centralized filter processing function
        const processCriteria = (criteria) => {
          criteria.forEach(c => {
            switch (c.$tag) {
              
              case "RegionNameFilter":
                if (c.value && c.value.region_name) {
                  filters.p_region_name = c.value.region_name;
                }
                break;
              
              case "ProjectNumberFilter":
                if (c.value && c.value.project_number) {
                  filters.p_project_number = c.value.project_number;
                }
                break;
              
              case "TenderNumberFilter":
                if (c.value && c.value.tender_number) {
                  filters.p_tender_number = c.value.tender_number;
                }
                break;
              
              case "RegionalManagerFilter":
                if (c.value && c.value.responsible_person) {
                  filters.p_responsible_person = c.value.responsible_person;
                }
                break;
              
              case "$keyword$":
                // Keyword search - free text search
                filters.p_keyword = c.text?.trim() || null;
                break;
            }
          });
        };

        // ✅ STEP 5: Handle both root-level and single-filter events
        if (event.value.$tag === "_root_") {
          // Multiple filters applied together
          processCriteria(event.value.criteria);
        } else {
          // Single filter applied
          processCriteria([event.value]);
        }

        // ✅ STEP 6: Log extracted filters
        console.log("🔍 Region Search Filters:");
        console.log("  p_region_name:", filters.p_region_name);
        console.log("  p_project_number:", filters.p_project_number);
        console.log("  p_tender_number:", filters.p_tender_number);
        console.log("  p_responsible_person:", filters.p_responsible_person);
        console.log("  p_keyword:", filters.p_keyword);

        // ✅ STEP 7: Map to searchObj (lowercase to match PL/SQL parameters)
        $variables.searchObj.p_region_id = filters.p_region_id || "";
        $variables.searchObj.p_region_name = filters.p_region_name || "";
        $variables.searchObj.p_project_id = filters.p_project_id || "";
        $variables.searchObj.p_project_number = filters.p_project_number || "";
        $variables.searchObj.p_tender_number = filters.p_tender_number || "";
        $variables.searchObj.p_tender_name = filters.p_tender_name || "";
        $variables.searchObj.p_responsible_person = filters.p_responsible_person || "";
        $variables.searchObj.p_person_id = filters.p_person_id || "";
        $variables.searchObj.p_created_by = filters.p_created_by || "";
        $variables.searchObj.p_keyword = filters.p_keyword || "";

        // ✅ STEP 8: Log final searchObj
        console.log("📤 searchObj (for PL/SQL):", JSON.stringify($variables.searchObj, null, 2));

        // ✅ STEP 9: Reset offset for new search
        $variables.searchObj.in_offset = '0';

        // ✅ STEP 10: Trigger search action chain
        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener',
        });

        console.log("✅ Smart Search filters applied successfully");

      } catch (error) {
        console.error("❌ Error in filterCriterionListener:", error);
      }
    }
  }
  
  return filterCriterionListener;
});