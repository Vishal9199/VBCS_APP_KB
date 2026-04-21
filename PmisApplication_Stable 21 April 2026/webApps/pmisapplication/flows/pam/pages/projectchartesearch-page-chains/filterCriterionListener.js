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
      const { $page, $variables, $tag, $keyword, $ge, $le } = context;

      try {
        console.log("🔍 Filter Event Captured ==> " + JSON.stringify(event.value));

        // Reset search object to default values (maintaining limit/offset)
        const currentLimit = $variables.searchObj.in_limit || 10;
        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj'],
        });

        // Ensure offset is reset to 0 when filters change
        $variables.searchObj.in_offset = 0;
        $variables.searchObj.in_limit = currentLimit;

        let l_ref_num = null;
        let l_region_id = null;
        let l_region_name = null;
        let l_project_id = null;
        let l_budget_number = null;
        let l_project_category = null;
        let l_project_number = null;
        let l_status_id = null;
        let l_keyword = null;
        let l_from_date = null;
        let l_to_date = null;
        let l_prj_number = null;

        const processCriteria = (criteria) => {
          if (!criteria) return;

          // Reference Number Filter
          if (criteria.$tag === "ReferenceNumberFilter" && criteria.value) {
            l_ref_num = typeof criteria.value === 'object' ? (criteria.value.lov_value || criteria.value.lov_label) : criteria.value;
          }

          // Region Filter
          if (criteria.$tag === "RegionFilter" && criteria.value) {
            l_region_id = criteria.value.lookup_value_id ?? null;
            l_region_name = criteria.value.lookup_value_name ?? null;
          }

          // Project Name Filter
          if (criteria.$tag === "ProjectNameFilter" && criteria.value) {
            l_project_id = criteria.value.project_id ?? null;
            l_project_number = criteria.value.project_charter_name ?? null;
          }

          //Project Number Filter
          if (criteria.$tag === "ProjectNumberFilter" && criteria.value) {
            l_prj_number = criteria.value.project_number?? null;
            
          }

          // Project Category Filter
          if (criteria.$tag === "ProjectCategoryFilter" && criteria.value) {
            l_project_category = criteria.value.project_category ?? null;
          }

          // Status Filter
          if (criteria.$tag === "StatusFilter" && criteria.value) {
            l_status_id = criteria.value.status_id ?? null;
          }

          // Keyword Filter
          if (criteria.$tag === "$keyword$" && (criteria.text || criteria.value)) {
            l_keyword = criteria.text || criteria.value;
          }

          // Date Range Filter
          if (criteria.$tag === "DateRangeFilter") {
            if (Array.isArray(criteria.criteria)) {
              criteria.criteria.forEach(subCriteria => {
                if (subCriteria.op === "$ge") {
                  l_from_date = subCriteria.value.created_date || subCriteria.value;
                } else if (subCriteria.op === "$le") {
                  l_to_date = subCriteria.value.created_date || subCriteria.value;
                }
              });
            } else if (criteria.value && criteria.value.created_date) {
              // Handle single date value if applicable
              if (criteria.op === "$ge") l_from_date = criteria.value.created_date;
              if (criteria.op === "$le") l_to_date = criteria.value.created_date;
            }
          }
        };

        if (event.value) {
          if (event.value.$tag === "_root_") {
            event.value.criteria.forEach(processCriteria);
          } else {
            processCriteria(event.value);
          }
        }

        // Map to searchObj (using lowercase keys as defined in page.json)
        $variables.searchObj.p_ref_num = l_ref_num;
        $variables.searchObj.p_region_id = l_region_id ? String(l_region_id) : null;
        $variables.searchObj.p_region_name = l_region_name;
        $variables.searchObj.p_project_id = l_project_id ? String(l_project_id) : null;
        $variables.searchObj.p_project_category = l_project_category;
        $variables.searchObj.p_project_charter_name = l_project_number;
        $variables.searchObj.p_status_id = l_status_id ? String(l_status_id) : null;
        $variables.searchObj.p_keyword = l_keyword;
        $variables.searchObj.p_budget_number = l_budget_number;
        $variables.searchObj.p_from_date = l_from_date;
        $variables.searchObj.p_to_date = l_to_date;
        $variables.searchObj.p_project_number = l_prj_number;
        
        

        console.log("✅ Search Object Updated ==> " + JSON.stringify($variables.searchObj));

        // 🚀 Trigger search automatically
        await Actions.callChain(context, {
          chain: 'searchAC',
        });

      } catch (error) {
        console.error("Filter Error: ", error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Filter Error',
          message: 'Failed to apply filter: ' + error.message,
          type: 'error',
        });
      }
    }
  }

  return filterCriterionListener;
});