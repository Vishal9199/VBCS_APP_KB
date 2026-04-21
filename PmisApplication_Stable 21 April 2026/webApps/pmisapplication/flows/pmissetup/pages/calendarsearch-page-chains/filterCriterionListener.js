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
      const { $page, $variables, $tag, $ge, $le, $keyword } = context;

      try {
        console.log("==> Filter Event:", JSON.stringify(event.value));

        // ✅ STEP 1: Reset searchObj for clean state
        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj'],
        });

        // ✅ STEP 2: Initialize filter collection (all lowercase)
        let filters = {
          p_calendar_type: null,
          p_calendar_name: null,
          // p_from_date: null,
          // p_to_date: null,
          p_enabled_flag: null,
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
              
              case "CalendarTypeFilter":
                if (c.value && c.value.lookup_value_code) {
                  filters.p_calendar_type = c.value.lookup_value_code;
                }
                break;
              
              case "CalendarNameFilter":
                if (c.value && c.value.calendar_name) {
                  filters.p_calendar_name = c.value.calendar_name;
                }
                break;
              
              case "StatusFilter":
                if (c.value && c.value.enabled_flag) {
                  filters.p_enabled_flag = c.value.enabled_flag;
                }
                break;
              
              case "DateRangeFilter":
                if (Array.isArray(c.criteria)) {
                  c.criteria.forEach(subCriteria => {
                    if (subCriteria.op === "$ge") {
                      // $ge = Greater than or equal = FROM date
                      filters.p_from_date = subCriteria.value?.creation_date || null;
                    } else if (subCriteria.op === "$le") {
                      // $le = Less than or equal = TO date
                      filters.p_to_date = subCriteria.value?.creation_date || null;
                    }
                  });
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
        console.log("🔍 Calendar Search Filters:");
        console.log("  p_calendar_type:", filters.p_calendar_type);
        console.log("  p_calendar_name:", filters.p_calendar_name);
        // console.log("  p_from_date:", filters.p_from_date);
        // console.log("  p_to_date:", filters.p_to_date);
        console.log("  p_enabled_flag:", filters.p_enabled_flag);
        console.log("  p_keyword:", filters.p_keyword);

        // ✅ STEP 7: Map to searchObj (all lowercase)
        $variables.searchObj.p_calendar_type = filters.p_calendar_type || "";
        $variables.searchObj.p_calendar_name = filters.p_calendar_name || "";
        // $variables.searchObj.p_from_date = filters.p_from_date || "";
        // $variables.searchObj.p_to_date = filters.p_to_date || "";
        // $variables.searchObj.p_calendar_id = filters.p_calendar_type;
        $variables.searchObj.p_enabled_flag = filters.p_enabled_flag || "";
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