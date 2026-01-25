define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class filterCriterionListener extends ActionChain {
    async run(context, { event }) {
      const { $variables, $tag, $ge, $le, $keyword } = context;

      if(!$variables.triggerSmartSearchActionChain) {
        return;
      }

      try {
        console.log("==> Filter Event:", JSON.stringify(event?.value));

        // Reset Search Object
        await Actions.resetVariables(context, {
          variables: ['$variables.SearchObj'],
        });

        // Internal filter holder (UPPERCASE for processing)
        let filters = {
          P_STRATEGY_HDR_ID: null,
          P_PR_NUMBER: null,
          P_TENDER_TYPE: null,
          P_TENDER_CATEGORY: null,
          P_VARIATION_TYPE: null,
          P_STATUS_ID: null,
          P_CONTRACT_OWNER_ID: null,
          P_CREATED_BY: null,          // 👈 EmployeeFilter maps here
          P_FROM_DATE: null,
          P_TO_DATE: null,
          P_KEYWORD: null
        };

        // Handle reset / clear filters
        if (!event || !event.value) {
          console.log("No filter value received. Reloading default list.");

          $variables.SearchObj.in_offset = '0';

          await Actions.callChain(context, {
            chain: 'vbAfterNavigateListener',
          });

          return;
        }

        // Process Smart Search criteria
        const processCriteria = (criteria) => {
          criteria.forEach(c => {
            switch (c.$tag) {

              case "ContractOwnerFilter":
                if (c.value?.person_id) {
                  filters.P_CONTRACT_OWNER_ID = c.value.person_id;
                }
                break;

              case "StatusFilter":
                if (c.value?.status_id) {
                  filters.P_STATUS_ID = c.value.status_id;
                }
                break;

              case "TenderTypeFilter":
                if (c.value?.id) {
                  filters.P_TENDER_TYPE = c.value.id;
                }
                break;

              case "TenderCategoryFilter":
                if (c.value?.id) {
                  filters.P_TENDER_CATEGORY = c.value.id;
                }
                break;

              case "VariationTypeFilter":
                if (c.value?.id) {
                  filters.P_VARIATION_TYPE = c.value.id;
                }
                break;

              // ✅ Employee Smart Search Filter
              // value comes from optionsKeys.value = email_address
              case "EmployeeFilter":
                if (c.value?.email_address) {
                  filters.P_CREATED_BY = c.value.email_address;
                }
                break;

              case "RequestDateRangeFilter":
                if (Array.isArray(c.criteria)) {
                  c.criteria.forEach(sub => {
                    if (sub.op === "$ge") {
                      filters.P_FROM_DATE = sub.value?.request_date || null;
                    }
                    if (sub.op === "$le") {
                      filters.P_TO_DATE = sub.value?.request_date || null;
                    }
                  });
                }
                break;

              case "$keyword$":
                filters.P_KEYWORD = c.text?.trim() || null;
                break;
            }
          });
        };

        // Handle root or single filter
        if (event.value.$tag === "_root_") {
          processCriteria(event.value.criteria);
        } else {
          processCriteria([event.value]);
        }

        // Debug – extracted filters
        console.log("🔍 Applied Filters (Internal):", filters);

        // ✅ Assign to SearchObj (LOWERCASE → PL/SQL)
        $variables.SearchObj.p_strategy_hdr_id = filters.P_STRATEGY_HDR_ID || "";
        $variables.SearchObj.p_pr_number = filters.P_PR_NUMBER || "";
        $variables.SearchObj.p_tender_type = filters.P_TENDER_TYPE || "";
        $variables.SearchObj.p_tender_category = filters.P_TENDER_CATEGORY || "";
        $variables.SearchObj.p_variation_type = filters.P_VARIATION_TYPE || "";
        $variables.SearchObj.p_status_id = filters.P_STATUS_ID || "";
        $variables.SearchObj.p_contract_owner_id = filters.P_CONTRACT_OWNER_ID || "";
        $variables.SearchObj.p_created_by = filters.P_CREATED_BY || "";   // 👈 Employee applied
        $variables.SearchObj.p_from_date = filters.P_FROM_DATE || "";
        $variables.SearchObj.p_to_date = filters.P_TO_DATE || "";
        $variables.SearchObj.p_keyword = filters.P_KEYWORD || "";

        console.log(
          "📤 Final SearchObj:",
          JSON.stringify($variables.SearchObj, null, 2)
        );

        // Reset pagination
        $variables.SearchObj.in_offset = '0';

        // Reload data
        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener',
          params: {
            callRest: true,
          },
        });

        console.log("✅ Smart Search executed successfully");

      } catch (error) {
        console.error("❌ Error in filterCriterionListener:", error);
      }
    }
  }

  return filterCriterionListener;
});
