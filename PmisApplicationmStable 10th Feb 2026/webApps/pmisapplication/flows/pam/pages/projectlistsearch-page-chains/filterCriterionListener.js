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

  class filterCriterionListener extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{}} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log("🔍 Filter Criterion Event ==> " + JSON.stringify(event.value));
        
        // Reset searchObj to default values
        await Actions.resetVariables(context, {
          variables: [
            '$variables.searchObj',
          ],
        });

        // ✅ CRITICAL: Reset offset to '0' when filters change (return to first page)
        $variables.searchObj.in_offset = '0';

        let l_project_id = null;
        let l_project_category = null;
        let l_location = null;
        let l_project_name = null;
        let l_mp_ref_num = null;
        let l_region_code = null;
        let l_keyword = null;
        let l_from_date = null;
        let l_to_date = null;
        let l_status = null;

        if (event.value) {
          if (event.value.$tag === "_root_") {
            // Multiple filters applied
            let data = event.value;
            data.criteria.forEach(criteria => {
              // Project Name Filter
              if (criteria.$tag === "ProjectNameFilter" && criteria.value) {
                l_project_id = criteria.value.project_id;
                l_project_name = criteria.value.project_name;
              }
              // Project Category Filter
              if (criteria.$tag === "ProjectCategoryFilter" && criteria.value) {
                l_project_category = criteria.value.lookup_value_name;
                // l_project_name = criteria.value.project_name;
              }
              // Project Location Filter
              if (criteria.$tag === "LocationFilter" && criteria.value) {
                l_location = criteria.value.project_location;
              }

              // Reference Number Filter
              if (criteria.$tag === "ReferenceNumberFilter" && criteria.value) {
                l_mp_ref_num = criteria.value.mp_ref_num;
              }

              // Region Filter
              if (criteria.$tag === "RegionFilter" && criteria.value) {
                l_region_code = criteria.value.lookup_value_code;
                $variables.dependentLocation = l_region_code;
              }

              // Status Filter
              if (criteria.$tag === "StatusFilter" && criteria.value) {
                l_status = criteria.value.active_flag;
              }

              // Keyword Filter
              if (criteria.$tag === "$keyword$" && criteria.text) {
                l_keyword = criteria.text;
              }

              // Date Range Filter
              if (criteria.$tag === "DateRangeFilter" && Array.isArray(criteria.criteria)) {
                for (const subCriteria of criteria.criteria) {
                  if (subCriteria.op === "$ge") {
                    l_from_date = subCriteria.value.created_date;
                  } else if (subCriteria.op === "$le") {
                    l_to_date = subCriteria.value.created_date;
                  }
                }
              }
            });
          } else {
            // Single filter applied
            let data = event.value;
            
            // Project Name Filter (Single Selection)
            if (data.$tag === "ProjectNameFilter" && data.value && typeof data.value === 'object') {
              l_project_id = data.value.project_id ?? '';
              l_project_name = data.value.project_name ?? '';
            }

            // Project Category Filter
              if (data.$tag === "ProjectCategoryFilter" && data.value && typeof data.value === 'object') {
                l_project_category = data.value.lookup_value_name;
                // l_project_name = criteria.value.project_name;
              }
              // Project Location Filter
              if (data.$tag === "LocationFilter" && data.value && typeof data.value === 'object') {
                l_location = data.value.project_location;
              }

            // Reference Number Filter (Single Selection)
            if (data.$tag === "ReferenceNumberFilter" && data.value && typeof data.value === 'object') {
              l_mp_ref_num = data.value.mp_ref_num ?? '';
            }

            // Region Filter (Single Selection)
            if (data.$tag === "RegionFilter" && data.value && typeof data.value === 'object') {
              l_region_code = data.value.lookup_value_code ?? '';
            }

            // Status Filter (Single Selection)
            if (data.$tag === "StatusFilter" && data.value && typeof data.value === 'object') {
              l_status = data.value.active_flag ?? '';
            }

            // Keyword Filter
            if (data.$tag === "$keyword$" && typeof data.text === 'string') {
              l_keyword = data.text;
            }

            // Date Range Filter
            if (data.$tag === "DateRangeFilter" && Array.isArray(data.criteria)) {
              data.criteria.forEach(criteriaItem => {
                if (criteriaItem.$tag === "DateRangeFilter" && criteriaItem.value && criteriaItem.value.created_date) {
                  if (criteriaItem.op === "$ge") {
                    l_from_date = criteriaItem.value.created_date;
                  } else if (criteriaItem.op === "$le") {
                    l_to_date = criteriaItem.value.created_date;
                  }
                }
              });
            }
          }
        }

        // Map to search object
        $variables.searchObj.p_project_id = l_project_id || "";
        $variables.searchObj.p_project_category = l_project_category || "";
        $variables.searchObj.p_location = l_location || "";
        $variables.searchObj.p_project_name = l_project_name || "";
        $variables.searchObj.p_mp_ref_num = l_mp_ref_num || "";
        $variables.searchObj.p_region_code = l_region_code || "";
        $variables.searchObj.p_keyword = l_keyword || "";
        $variables.searchObj.p_from_date = l_from_date || "";
        $variables.searchObj.p_to_date = l_to_date || "";
        $variables.searchObj.p_status = l_status || "";

        console.log("✅ Search Object Updated (Offset reset to 0) ==> " + JSON.stringify($variables.searchObj));
        console.log("📊 Filter Details:");
        console.log("  - Project ID: " + l_project_id);
        console.log("  - Project Name: " + l_project_name);
        console.log("  - Reference Number: " + l_mp_ref_num);
        console.log("  - Region ID: " + l_region_code);
        console.log("  - Status: " + l_status);
        console.log("  - Keyword: " + l_keyword);
        console.log("  - From Date: " + l_from_date);
        console.log("  - To Date: " + l_to_date);

        // 🚀 CRITICAL FIX: Automatically trigger search after filter changes
        console.log("🔍 Triggering automatic search with filtered parameters...");
        
        await Actions.callChain(context, {
          chain: 'searchProjectDetailsAction',
        });

        console.log("✅ Filtered search completed successfully");

      } catch (error) {
        console.error("❌ Error in filterCriterionListener:", error);
        
        // Show error notification to user
        await Actions.fireNotificationEvent(context, {
          summary: 'Filter Error',
          message: 'Failed to apply filter: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return filterCriterionListener;
});