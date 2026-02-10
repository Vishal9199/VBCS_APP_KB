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

  class loadCalendarYearRangesAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {number} params.calendarId
     * @param {number} params.projectId
     */
    async run(context, { calendarId, projectId }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log('Loading calendar year ranges for calendar ID:', calendarId);

        let enc_calendar_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: calendarId,
          },
        });
        // let enc_project_id = await Actions.callChain(context, {
        //   chain: 'application:encryptAC',
        //   params: {
        //     input: projectId,
        //   },
        // });
        // console.log(
        //   '%c Calendars data:',
        //   'color: green; background:black; font-size: 14px',
        //   enc_project_id
        // );

        // Call REST endpoint to get calendar year ranges
        const callRestEndpointGetCalendarYearRangesResult = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamBudgetcostYearprompts',
          headers: {
            'x-session-id': enc_calendar_id,
            // 'x-session-cache': enc_project_id,
          },
        });

        const yearRanges = callRestEndpointGetCalendarYearRangesResult.body.items;

        if (yearRanges && yearRanges.length > 0) {
          console.log('Year ranges loaded:', yearRanges.length);

          $variables.calendarYearRangesADP.data = yearRanges;

          // Assign year ranges to ADP
          // await Actions.assignVariables(context, {
          //   $variables: {
          //     calendarYearRangesADP: {
          //       data: yearRanges,
          //     },
          //   },
          // });

          // Populate year_prompt fields in budgetCostLineVar
          const updates = {
            year_prompt1: yearRanges[0]?.year_prompt || '',
            year_prompt2: yearRanges[1]?.year_prompt || '',
            year_prompt3: yearRanges[2]?.year_prompt || '',
            year_prompt4: yearRanges[3]?.year_prompt || '',
            year_prompt5: yearRanges[4]?.year_prompt || '',
            year_prompt6: yearRanges[5]?.year_prompt || '',
            year_prompt7: yearRanges[6]?.year_prompt || '',
          };

          // await Actions.assignVariables(context, {
          //   $variables: {
          //     budgetCostLineVar: updates,
          //   },
          // });

          // $variables.budgetCostLineVar = updates;
          $variables.budgetCostLineVar = {
            ...$variables.budgetCostLineVar,  // ✅ Spread existing values (preserves everything)
            ...updates                         // ✅ Merge in new year_prompt values
          };

          // await Actions.fireNotificationEvent(context, {
          //   summary: 'Success',
          //   message: `Loaded ${yearRanges.length} year ranges`,
          //   displayMode: 'transient',
          //   type: 'confirmation',
          // });

        } else {
          console.log('No year ranges found for calendar ID:', calendarId);

          // await Actions.assignVariables(context, {
          //   $variables: {
          //     calendarYearRangesADP: {
          //       data: [],
          //     },
          //   },
          // });
          $variables.calendarYearRangesADP.data = [];

          await Actions.fireNotificationEvent(context, {
            summary: 'Warning',
            message: 'No year ranges configured for selected calendar',
            displayMode: 'transient',
            type: 'warning',
          });
        }

      } catch (error) {
        console.error('Error loading calendar year ranges:', error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load calendar year ranges: ' + error.message,
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return loadCalendarYearRangesAC;
});