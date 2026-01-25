// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (ActionChain, Actions, ActionUtils) => {
//   'use strict';

//   class filterCriterionListener extends ActionChain {
//     async run(context, { event }) {
//       const { $variables, $tag, $keyword, $ge, $le, $functions, $application, $page } = context;

//       try {
//         console.log("==> Filter Event:", JSON.stringify(event.value));

//         // Initialize all filter parameters
//         let filters = {
//           P_CONTRACT_HOLDER_ID: null,
//           P_CONTRACT_OWNER_ID: null,
//           P_STATUS_ID: null,
//           P_FROM_DATE: null,
//           P_TO_DATE: null,
//           P_REQUEST_NUMBER: null
//         };

//         // Handle empty/reset scenario
//         if (!event || !event.value) {
//           console.log("No event value found - resetting filters.");
          
//           await Actions.resetVariables(context, {
//             variables: ['$variables.SearchObj'],
//           });
          
//           await Actions.callChain(context, {
//             chain: 'vbAfterNavigateListener',
//           });
          
//           return;
//         }

//         // Process filter criteria
//         const processCriteria = (criteria) => {
//           criteria.forEach(c => {
//             switch (c.$tag) {
              
//               case "ContractHolderFilter":
//                 filters.P_CONTRACT_HOLDER_ID = c.value?.person_id || null;
//                 break;
              
//               case "ContractOwnerFilter":
//                 filters.P_CONTRACT_OWNER_ID = c.value?.person_id || null;
//                 break;
              
//               case "StatusFilter":
//                 filters.P_STATUS_ID = c.value?.status_id || null;
//                 break;
              
//               case "RequestDateRangeFilter":
//                 if (Array.isArray(c.criteria)) {
//                   c.criteria.forEach(subCriteria => {
//                     if (subCriteria.op === "$ge") {
//                       // Greater than or equal = FROM date
//                       filters.P_FROM_DATE = subCriteria.value?.request_date || null;
//                     } else if (subCriteria.op === "$le") {
//                       // Less than or equal = TO date
//                       filters.P_TO_DATE = subCriteria.value?.request_date || null;
//                     }
//                   });
//                 }
//                 break;
              
//               case "$keyword$":
//                 // Keyword search for Request Number
//                 filters.P_REQUEST_NUMBER = c.text?.trim() || null;
//                 break;
//             }
//           });
//         };

//         // Handle root-level or single-filter events
//         if (event.value.$tag === "_root_") {
//           processCriteria(event.value.criteria);
//         } else {
//           processCriteria([event.value]);
//         }

//         // Log the extracted filters
//         console.log("🔍 Tender Strategy Search Filters:");
//         console.log("  P_CONTRACT_HOLDER_ID:", filters.P_CONTRACT_HOLDER_ID);
//         console.log("  P_CONTRACT_OWNER_ID:", filters.P_CONTRACT_OWNER_ID);
//         console.log("  P_STATUS_ID:", filters.P_STATUS_ID);
//         console.log("  P_FROM_DATE:", filters.P_FROM_DATE);
//         console.log("  P_TO_DATE:", filters.P_TO_DATE);
//         console.log("  P_REQUEST_NUMBER:", filters.P_REQUEST_NUMBER);

//         // Assign filters to searchObj variable
//         Object.keys(filters).forEach(key => {
//           $variables.SearchObj[key] = filters[key] || "";
//         });

//         // Reset offset for new search
//         $variables.SearchObj.IN_OFFSET = '0';

//         // Call the data loading action chain
//         await Actions.callChain(context, {
//           chain: 'vbAfterNavigateListener',
//         });

//         console.log("✅ Smart Search filters applied successfully");

//       } catch (error) {
//         console.error("❌ Error in filterCriterionListener:", error);
//       }
//     }
//   }
  
//   return filterCriterionListener;
// });


define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class filterCriterionListener extends ActionChain {
    async run(context, { event }) {
      const { $variables } = context;

      try {
        console.log("==> Filter Event:", JSON.stringify(event.value));

        // Reset SearchObj
        await Actions.resetVariables(context, {
          variables: ['$variables.SearchObj'],
        });

        // Initialize all filter parameters (UPPERCASE for processing)
        let filters = {
          P_STRATEGY_HDR_ID: null,
          P_PR_NUMBER: null,
          P_TENDER_TYPE: null,
          P_TENDER_CATEGORY: null,
          P_STATUS_ID: null,
          P_CONTRACT_OWNER_ID: null,
          P_CREATED_BY: null,
          P_FROM_DATE: null,
          P_TO_DATE: null,
          P_KEYWORD: null
        };

        // Handle empty/reset scenario
        if (!event || !event.value) {
          console.log("No event value - resetting filters");
          
          // Reset offset and call search
          $variables.SearchObj.in_offset = '0';
          
          await Actions.callChain(context, {
            chain: 'vbAfterNavigateListener',
          });
          
          return;
        }

        // Process filter criteria
        const processCriteria = (criteria) => {
          criteria.forEach(c => {
            switch (c.$tag) {
              
              case "ContractOwnerFilter":
                if (c.value && c.value.person_id) {
                  filters.P_CONTRACT_OWNER_ID = c.value.person_id;
                }
                break;
              
              case "StatusFilter":
                if (c.value && c.value.status_id) {
                  filters.P_STATUS_ID = c.value.status_id;
                }
                break;
              
              case "RequestDateRangeFilter":
                if (Array.isArray(c.criteria)) {
                  c.criteria.forEach(subCriteria => {
                    if (subCriteria.op === "$ge") {
                      filters.P_FROM_DATE = subCriteria.value?.request_date || null;
                    } else if (subCriteria.op === "$le") {
                      filters.P_TO_DATE = subCriteria.value?.request_date || null;
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

        // Handle root-level or single-filter events
        if (event.value.$tag === "_root_") {
          processCriteria(event.value.criteria);
        } else {
          processCriteria([event.value]);
        }

        // Log the extracted filters (UPPERCASE)
        console.log("🔍 Tender Strategy Search Filters (Internal):");
        console.log("  P_CONTRACT_OWNER_ID:", filters.P_CONTRACT_OWNER_ID);
        console.log("  P_STATUS_ID:", filters.P_STATUS_ID);
        console.log("  P_FROM_DATE:", filters.P_FROM_DATE);
        console.log("  P_TO_DATE:", filters.P_TO_DATE);
        console.log("  P_KEYWORD:", filters.P_KEYWORD);

        // ✅ CRITICAL: Assign to SearchObj with LOWERCASE keys to match PL/SQL
        $variables.SearchObj.p_strategy_hdr_id = filters.P_STRATEGY_HDR_ID || "";
        $variables.SearchObj.p_pr_number = filters.P_PR_NUMBER || "";
        $variables.SearchObj.p_tender_type = filters.P_TENDER_TYPE || "";
        $variables.SearchObj.p_tender_category = filters.P_TENDER_CATEGORY || "";
        $variables.SearchObj.p_status_id = filters.P_STATUS_ID || "";
        $variables.SearchObj.p_contract_owner_id = filters.P_CONTRACT_OWNER_ID || "";
        $variables.SearchObj.p_created_by = filters.P_CREATED_BY || "";
        $variables.SearchObj.p_from_date = filters.P_FROM_DATE || "";
        $variables.SearchObj.p_to_date = filters.P_TO_DATE || "";
        $variables.SearchObj.p_keyword = filters.P_KEYWORD || "";

        // Log the final SearchObj (lowercase)
        console.log("📤 SearchObj (lowercase keys for PL/SQL):", JSON.stringify($variables.SearchObj, null, 2));

        // Reset offset for new search
        $variables.SearchObj.in_offset = '0';

        // Call the data loading action chain
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