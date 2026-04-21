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
      const { $page, $variables } = context;

      try {
        console.log("🔍 Filter Event Captured ==>", JSON.stringify(event.value));

        // Initialize all search parameters to default values
        let searchParams = {
          in_limit: '10',
          in_offset: '0',
          p_keyword: '',
          p_tender_id: '',
          p_tender_number: '',
          p_tender_name: '',
          p_project_id: '',
          p_project_number: '',
          p_project_name: '',
          p_general_manager_id: '',
          p_general_manager_name: '',
          p_proj_mgr_user_id: '',
          p_proj_mgr_name: '',
          p_region_code: '',
          p_status_code: ''
        };

        if (event.value) {
          if (event.value.$tag === "_root_") {
            // ============================================================
            // Handle multiple filters (_root_ tag means combined filters)
            // ============================================================
            let data = event.value;
            data.criteria.forEach(criteria => {
              
              // ==================== TENDER FILTERS ====================
              
              // Tender Name Filter
              // LOV returns: {tender_name: <tender_id_value>}
              // We need to extract the tender_id from the property value
              if (criteria.$tag === "TenderNameFilter" && criteria.value) {
                if (criteria.value.tender_name) {
                  searchParams.p_tender_id = String(criteria.value.tender_name);
                }
              }

              // Tender Number Filter
              // LOV returns: {tender_number: <tender_id_value>}
              if (criteria.$tag === "TenderNumberFilter" && criteria.value) {
                if (criteria.value.tender_number) {
                  searchParams.p_tender_id = String(criteria.value.tender_number);
                }
              }

              // ==================== PROJECT FILTERS ====================
              
              // Project Name Filter
              // LOV returns: {project_name: <project_id_value>}
              // The property name is "project_name" but the value is actually the project_id
              if (criteria.$tag === "ProjectNameFilter" && criteria.value) {
                if (criteria.value.project_name) {
                  searchParams.p_project_id = String(criteria.value.project_name);
                }
              }

              // Project Number Filter
              // LOV returns: {project_number: <project_id_value>}
              if (criteria.$tag === "ProjectNumberFilter" && criteria.value) {
                if (criteria.value.project_number) {
                  searchParams.p_project_id = String(criteria.value.project_number);
                }
              }

              // ==================== MANAGER FILTERS ====================
              
              // General Manager Filter
              // LOV returns: {general_manager_id: <user_id_value>}
              if (criteria.$tag === "GeneralManagerFilter" && criteria.value) {
                if (criteria.value.general_manager_id) {
                  searchParams.p_general_manager_id = String(criteria.value.general_manager_id);
                }
              }

              // Project Manager Filter
              // LOV returns: {proj_mgr_user_id: <user_id_value>}
              if (criteria.$tag === "ProjectManagerFilter" && criteria.value) {
                if (criteria.value.proj_mgr_user_id) {
                  searchParams.p_proj_mgr_user_id = String(criteria.value.proj_mgr_user_id);
                }
              }

              // ==================== OTHER FILTERS ====================
              
              // Region Filter
              // LOV returns: {region_name: <region_name_value>}
              if (criteria.$tag === "RegionFilter" && criteria.value) {
                if (criteria.value.region_name) {
                  searchParams.p_region_code = criteria.value.region_name;
                }
              }

              // Status Filter
              // LOV returns: {status_code: <status_code_value>}
              if (criteria.$tag === "StatusFilter" && criteria.value) {
                if (criteria.value.status_code) {
                  searchParams.p_status_code = criteria.value.status_code;
                }
              }

              // Keyword Filter
              if (criteria.$tag === "$keyword$" && criteria.text) {
                searchParams.p_keyword = criteria.text;
              }
            });

          } else {
            // ============================================================
            // Handle single filter (when only one filter is applied)
            // ============================================================
            let data = event.value;

            // ==================== TENDER FILTERS ====================
            
            // Tender Name Filter
            if (data.$tag === "TenderNameFilter" && data.value && typeof data.value === 'object') {
              if (data.value.tender_name) {
                searchParams.p_tender_id = String(data.value.tender_name);
                console.log("🎯 Tender Name Filter - Extracted tender_id:", searchParams.p_tender_id);
              }
            }

            // Tender Number Filter
            if (data.$tag === "TenderNumberFilter" && data.value && typeof data.value === 'object') {
              if (data.value.tender_number) {
                searchParams.p_tender_id = String(data.value.tender_number);
                console.log("🎯 Tender Number Filter - Extracted tender_id:", searchParams.p_tender_id);
              }
            }

            // ==================== PROJECT FILTERS ====================
            
            // Project Name Filter
            // CRITICAL: LOV returns {project_name: 1944} where 1944 is the project_id
            if (data.$tag === "ProjectNameFilter" && data.value && typeof data.value === 'object') {
              if (data.value.project_name) {
                searchParams.p_project_id = String(data.value.project_name);
                console.log("🎯 Project Name Filter - Extracted project_id:", searchParams.p_project_id, "from raw value:", data.value);
              }
            }

            // Project Number Filter
            if (data.$tag === "ProjectNumberFilter" && data.value && typeof data.value === 'object') {
              if (data.value.project_number) {
                searchParams.p_project_id = String(data.value.project_number);
                console.log("🎯 Project Number Filter - Extracted project_id:", searchParams.p_project_id);
              }
            }

            // ==================== MANAGER FILTERS ====================
            
            // General Manager Filter
            if (data.$tag === "GeneralManagerFilter" && data.value && typeof data.value === 'object') {
              if (data.value.general_manager_id) {
                searchParams.p_general_manager_id = String(data.value.general_manager_id);
                console.log("🎯 General Manager Filter - Extracted user_id:", searchParams.p_general_manager_id);
              }
            }

            // Project Manager Filter
            if (data.$tag === "ProjectManagerFilter" && data.value && typeof data.value === 'object') {
              if (data.value.proj_mgr_user_id) {
                searchParams.p_proj_mgr_user_id = String(data.value.proj_mgr_user_id);
                console.log("🎯 Project Manager Filter - Extracted user_id:", searchParams.p_proj_mgr_user_id);
              }
            }

            // ==================== OTHER FILTERS ====================
            
            // Region Filter
            if (data.$tag === "RegionFilter" && data.value && typeof data.value === 'object') {
              if (data.value.region_name) {
                searchParams.p_region_code = data.value.region_name;
                console.log("🎯 Region Filter - Extracted region_name:", searchParams.p_region_code);
              }
            }

            // Status Filter
            if (data.$tag === "StatusFilter" && data.value && typeof data.value === 'object') {
              if (data.value.status_code) {
                searchParams.p_status_code = data.value.status_code;
                console.log("🎯 Status Filter - Extracted status_code:", searchParams.p_status_code);
              }
            }

            // Keyword Filter
            if (data.$tag === "$keyword$" && typeof data.text === 'string') {
              searchParams.p_keyword = data.text;
              console.log("🎯 Keyword Filter - Extracted text:", searchParams.p_keyword);
            }
          }
        }

        // ============================================================
        // Update searchObj with all parameters at once (atomic update)
        // ============================================================
        $variables.searchObj = {
          ...$variables.searchObj,
          ...searchParams
        };

        console.log("✅ Search Object Updated ==>", JSON.stringify($variables.searchObj));

        // ============================================================
        // Trigger search automatically
        // ============================================================
        await Actions.callChain(context, {
          chain: 'searchAC',
        });

        console.log("🚀 Search triggered automatically");

      } catch (error) {
        console.error("❌ Error in filterCriterionListener:", error);
        console.error("❌ Error stack:", error.stack);
      }
    }
  }

  return filterCriterionListener;
});