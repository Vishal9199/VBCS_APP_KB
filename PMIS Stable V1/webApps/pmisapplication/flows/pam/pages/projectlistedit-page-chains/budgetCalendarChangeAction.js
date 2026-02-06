// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (
//   ActionChain,
//   Actions,
//   ActionUtils
// ) => {
//   'use strict';

//   class budgetCalendarChangeAction extends ActionChain {

//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {any} params.value
//      * @param {any} params.previousValue
//      * @param {object} params.event
//      * @param {any} params.data
//      * @param {any} params.key
//      */
//     async run(context, { value, previousValue, event, data, key }) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       // await Actions.fireNotificationEvent(context, {
//       //   summary: data.calendar_name,
//       // });

//       const tempCalName = data.calendar_name;

//       try {
//         // Clear validation message
//         // await Actions.assignVariables(context, {
//         //   $variables: {
//         //     budgetValidationMessage: '',
//         //     activeYearFieldIndex: null,
//         //   },
//         // });

//         await Actions.resetVariables(context, {
//           variables: [
//             '$variables.budgetValidationMessage',
//             '$variables.activeYearFieldIndex',
//           ],
//         });
        

//         // If calendar is selected
//         if (value) {
//           // console.log("key | value = ", key + ' | ' + value);
//           // Load calendar year ranges
//           await Actions.callChain(context, {
//             chain: 'loadCalendarYearRangesAC',
//             params: {
//               calendarId: key,
//               // projectId: $variables.masterPlanHeaderVar.project_id,
//             },
//           });
//           // console.log("+++++++++++++++++2222222222222222: ", JSON.stringify(event.detail.data));
//           console.log("+++++++++111111: ", tempCalName);
          
//           // Clear all year values
          
//           console.log(
//                     '%c I have %s',
//                     'color: green; background:black; font-size: 20pt',
//                     tempCalName
//                   )
//           // ✅ CRITICAL FIX: Use spread operator to preserve year_prompts set by loadCalendarYearRangesAC
//           // This merges the new calendar info while keeping year_prompt1-7 that were just loaded
//           $variables.budgetCostLineVar = {
//             ...$variables.budgetCostLineVar,  // Preserve year_prompt1-7 from loadCalendarYearRangesAC
//             budget_year_id: value,
//             calendar_name: tempCalName,
//             year_value1: 0, year_value2: 0, year_value3: 0, year_value4: 0,
//             year_value5: 0, year_value6: 0, year_value7: 0,
//             additional_info: '',
//           };

//         } else {
//           // Calendar deselected - clear form
//           $variables.calendarYearRangesADP.data = [];
//             $variables.budgetCostLineVar = {
//               budget_year_id: null, year_prompt1: '', year_value1: 0, year_prompt2: '', year_value2: 0, 
//               year_prompt3: '', year_value3: 0, year_prompt4: '', year_value4: 0, year_prompt5: '', year_value5: 0,
//               year_prompt6: '', year_value6: 0, year_prompt7: '', year_value7: 0, additional_info: ''
//             };
//           }

//       } catch (error) {
//         console.error('Error in budgetCalendarChangeAction:', error);
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Error',
//           message: 'Failed to load calendar year ranges',
//           displayMode: 'transient',
//           type: 'error',
//         });
//       }
//     }
//   }

//   return budgetCalendarChangeAction;
// });


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

  class budgetCalendarChangeAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.value
     * @param {any} params.valueItem
     * Handles budget calendar selection change - loads year ranges and builds table columns
     * Integrates with existing loadCalendarYearRangesAC chain
     */
    async run(context, { value, valueItem }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log('Budget calendar changed:', value);

        if (!value) {
          console.log('No calendar selected, clearing year ranges and columns');
          $variables.calendarYearRangesADP.data = [];
          $variables.budgetEntryColumnsVar = [];
          
          // Clear budget form
          $variables.budgetCostLineVar = {
            ...$variables.budgetCostLineVar,
            budget_cost_id: null,
            year_value1: 0,
            year_value2: 0,
            year_value3: 0,
            year_value4: 0,
            year_value5: 0,
            year_value6: 0,
            year_value7: 0,
            additional_info: '',
          };
          
          return;
        }

        // Get calendar ID and project ID
        const calendarId = valueItem?.data?.cal_hdr_id || value;
        const projectId = $variables.masterPlanHeaderVar?.project_id || null;
        
        console.log('Loading year ranges for calendar ID:', calendarId);
        console.log('Project ID:', projectId);

        // Call existing action chain to load calendar year ranges
        // This chain already:
        // 1. Encrypts the calendar ID
        // 2. Calls REST API getPmispamBudgetcostYearprompts
        // 3. Populates calendarYearRangesADP.data
        // 4. Updates budgetCostLineVar with year_prompt1-7
        await Actions.callChain(context, {
          chain: 'loadCalendarYearRangesAC',
          params: {
            calendarId: calendarId,
            projectId: projectId
          }
        });

        // After year ranges are loaded, build dynamic table columns
        // Check if data was loaded successfully
        if ($variables.calendarYearRangesADP.data && 
            $variables.calendarYearRangesADP.data.length > 0) {
          
          console.log('Year ranges loaded successfully, building table columns...');
          
          await Actions.callChain(context, {
            chain: 'buildBudgetColumnsAC'
          });

          console.log('Budget table columns built successfully');

          // Load existing budget cost data for this project and calendar
          // This will populate budgetCostLineVar with saved values (if exists)
          // Or clear values if no saved data (ready for POST)
          console.log('Loading existing budget cost data...');
          await Actions.callChain(context, {
            chain: 'loadBudgetCostDataAC',
            params: {
              projectId: projectId,
              calendarId: calendarId
            }
          });

          console.log('Budget cost data loaded/initialized successfully');

        } else {
          console.warn('No year ranges loaded, clearing table columns');
          $variables.budgetEntryColumnsVar = [];
        }

      } catch (error) {
        console.error('Error in budgetCalendarChangeAction:', error);
        
        // Clear data on error
        $variables.calendarYearRangesADP.data = [];
        $variables.budgetEntryColumnsVar = [];

        // Show error notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'An error occurred while processing calendar selection: ' + error.message,
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return budgetCalendarChangeAction;
});