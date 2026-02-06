// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (ActionChain, Actions, ActionUtils) => {
//   'use strict';

//   class filterCriterionListener extends ActionChain {
    
//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {{}} params.event
//      */
//     async run(context, { event }) {
//       const { $page, $variables } = context;

//       try {
//         console.log("==> Filter Event:", JSON.stringify(event.value));

//         // ✅ STEP 1: Reset searchObj for clean state
//         await Actions.resetVariables(context, {
//           variables: ['$variables.searchObj'],
//         });

//         // ✅ STEP 2: Initialize filter collection (lowercase to match PL/SQL)
//         let filters = {
//           p_region_id: null,
//           p_region_name: null,
//           p_project_id: null,
//           p_project_number: null,
//           p_tender_number: null,
//           p_tender_name: null,
//           p_responsible_person: null,
//           p_person_id: null,
//           p_created_by: null,
//           p_keyword: null
//         };

//         // ✅ STEP 3: Handle empty/reset scenario
//         if (!event || !event.value) {
//           console.log("No event value - resetting filters");
          
//           // Reset offset and trigger search with empty filters
//           $variables.searchObj.in_offset = '0';
          
//           await Actions.callChain(context, {
//             chain: 'vbAfterNavigateListener',
//           });
          
//           return; // Exit early
//         }

//         // ✅ STEP 4: Define centralized filter processing function
//         const processCriteria = (criteria) => {
//           criteria.forEach(c => {
//             switch (c.$tag) {
              
//               case "RegionNameFilter":
//                 if (c.value && c.value.region_name) {
//                   filters.p_region_name = c.value.region_name;
//                 }
//                 break;
              
//               case "ProjectNumberFilter":
//                 if (c.value && c.value.project_number) {
//                   filters.p_project_number = c.value.project_number;
//                 }
//                 break;
              
//               case "TenderNumberFilter":
//                 if (c.value && c.value.tender_number) {
//                   filters.p_tender_number = c.value.tender_number;
//                 }
//                 break;
              
//               case "ResponsiblePersonNameFilter":
//                 console.log("Entered Person Filter");
//                 if (c.value) {
//                   console.log("Entered Person Filter Value: ", c.value);
//                   // filters.p_responsible_person = c.value.responsible_person;
//                   filters.p_person_id = c.value.user_id || c.value;
//                 }
//                 break;
              
//               case "$keyword$":
//                 // Keyword search - free text search
//                 filters.p_keyword = c.text?.trim() || null;
//                 break;
//             }
//           });
//         };

//         // ✅ STEP 5: Handle both root-level and single-filter events
//         if (event.value.$tag === "_root_") {
//           // Multiple filters applied together
//           processCriteria(event.value.criteria);
//         } else {
//           // Single filter applied
//           processCriteria([event.value]);
//         }

//         // ✅ STEP 6: Log extracted filters
//         console.log("🔍 Region Search Filters:");
//         console.log("  p_region_name:", filters.p_region_name);
//         console.log("  p_project_number:", filters.p_project_number);
//         console.log("  p_tender_number:", filters.p_tender_number);
//         console.log("  p_responsible_person:", filters.p_responsible_person);
//         console.log("  p_keyword:", filters.p_keyword);

//         // ✅ STEP 7: Map to searchObj (lowercase to match PL/SQL parameters)
//         $variables.searchObj.p_region_id = filters.p_region_id || "";
//         $variables.searchObj.p_region_name = filters.p_region_name || "";
//         $variables.searchObj.p_project_id = filters.p_project_id || "";
//         $variables.searchObj.p_project_number = filters.p_project_number || "";
//         $variables.searchObj.p_tender_number = filters.p_tender_number || "";
//         $variables.searchObj.p_tender_name = filters.p_tender_name || "";
//         $variables.searchObj.p_responsible_person = filters.p_responsible_person || "";
//         $variables.searchObj.p_person_id = filters.p_person_id || "";
//         $variables.searchObj.p_created_by = filters.p_created_by || "";
//         $variables.searchObj.p_keyword = filters.p_keyword || "";

//         // ✅ STEP 8: Log final searchObj
//         console.log("📤 searchObj (for PL/SQL):", JSON.stringify($variables.searchObj, null, 2));

//         // ✅ STEP 9: Reset offset for new search
//         $variables.searchObj.in_offset = '0';

//         // ✅ STEP 10: Trigger search action chain
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
    
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{}} params.event
     */
    async run(context, { event }) {
      const { $page, $variables } = context;

      try {
        console.log("==> Filter Event:", JSON.stringify(event.value));

        // âœ… STEP 1: Reset searchObj for clean state
        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj'],
        });

        // âœ… STEP 2: Initialize filter collection
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

        // âœ… STEP 3: Handle empty/reset scenario
        if (!event || !event.value) {
          console.log("No event value - resetting filters");
          $variables.searchObj.in_offset = '0';
          await Actions.callChain(context, {
            chain: 'vbAfterNavigateListener',
          });
          return;
        }

        // âœ… STEP 4: Define centralized filter processing function
        const processCriteria = (criteria) => {
          criteria.forEach(c => {
            console.log("Processing Criterion:", c.$tag, "Value:", c.value);
            
            switch (c.$tag) {
              
              case "RegionNameFilter":
                if (c.value && c.value.lookup_value_id) {
                  filters.p_region_id = c.value.lookup_value_id;
                  console.log("Region ID Set:", filters.p_region_id);
                }
                break;
              
              case "ProjectNumberFilter":
                if (c.value && c.value.project_number) {
                  filters.p_project_number = c.value.project_number;
                  console.log("Project Number Set:", filters.p_project_number);
                }
                break;
              
              case "TenderNumberFilter":
                if (c.value && c.value.tender_number) {
                  filters.p_tender_number = c.value.tender_number;
                  console.log("Tender Number Set:", filters.p_tender_number);
                }
                break;
              
              case "ResponsiblePersonNameFilter":
                console.log("Entered Person Filter - Full Value:", JSON.stringify(c.value));
                
                // âš ï¸ CRITICAL FIX: Handle both object and direct value scenarios
                if (c.value) {
                  // Check if c.value is an object with user_id property
                  if (typeof c.value === 'object' && c.value.user_id) {
                    filters.p_person_id = c.value.user_id;
                    console.log("Person ID Set (from object):", filters.p_person_id);
                  } 
                  // Check if c.value is directly the user_id number
                  else if (typeof c.value === 'number') {
                    filters.p_person_id = c.value;
                    console.log("Person ID Set (direct number):", filters.p_person_id);
                  }
                  // Fallback: try to use c.value directly as string
                  else {
                    filters.p_person_id = String(c.value);
                    console.log("Person ID Set (fallback string):", filters.p_person_id);
                  }
                } else {
                  console.log("Person Filter - No value found");
                }
                break;
              
              case "$keyword$":
                filters.p_keyword = c.text?.trim() || null;
                console.log("Keyword Set:", filters.p_keyword);
                break;
            }
          });
        };

        // âœ… STEP 5: Handle both root-level and single-filter events
        if (event.value.$tag === "_root_") {
          console.log("Processing multiple filters (root level)");
          processCriteria(event.value.criteria);
        } else {
          console.log("Processing single filter");
          processCriteria([event.value]);
        }

        // âœ… STEP 6: Log extracted filters
        console.log("🔍 Region Search Filters FINAL:");
        console.log("  p_region_id:", filters.p_region_id);
        console.log("  p_project_number:", filters.p_project_number);
        console.log("  p_tender_number:", filters.p_tender_number);
        console.log("  p_person_id:", filters.p_person_id);
        console.log("  p_keyword:", filters.p_keyword);

        // âœ… STEP 7: Map to searchObj
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

        // âœ… STEP 8: Log final searchObj
        console.log("📤 searchObj (final payload):", JSON.stringify($variables.searchObj, null, 2));

        // âœ… STEP 9: Reset offset for new search
        $variables.searchObj.in_offset = '0';

        // âœ… STEP 10: Trigger search action chain
        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener',
        });

        console.log("âœ… Smart Search filters applied successfully");

      } catch (error) {
        console.error("❌ Error in filterCriterionListener:", error);
      }
    }
  }
  
  return filterCriterionListener;
});