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

  class budgetEditAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.current 
     */
    async run(context, { current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log('Editing budget line:', current.data);

        // Populate form with selected budget line data
        await Actions.assignVariables(context, {
          $variables: {
            budgetCostLineVar: {
              budget_cost_id: current.data.budget_cost_id,
              object_version_num: current.data.object_version_num,
              project_id: current.data.project_id,
              budget_year_id: current.data.budget_year_id,
              calendar_name: current.data.calendar_name,
              year_prompt1: current.data.year_prompt1,
              year_value1: current.data.year_value1,
              year_prompt2: current.data.year_prompt2,
              year_value2: current.data.year_value2,
              year_prompt3: current.data.year_prompt3,
              year_value3: current.data.year_value3,
              year_prompt4: current.data.year_prompt4,
              year_value4: current.data.year_value4,
              year_prompt5: current.data.year_prompt5,
              year_value5: current.data.year_value5,
              year_prompt6: current.data.year_prompt6,
              year_value6: current.data.year_value6,
              year_prompt7: current.data.year_prompt7,
              year_value7: current.data.year_value7,
              additional_info: current.data.additional_info,
            },
            masterPlanHeaderVar: {
              budget_year_id: current.data.budget_year_id,
            },
          },
        });

        // Determine which field has the active value
        let activeIndex = null;
        if (current.data.year_value1 > 0) activeIndex = 1;
        else if (current.data.year_value2 > 0) activeIndex = 2;
        else if (current.data.year_value3 > 0) activeIndex = 3;
        else if (current.data.year_value4 > 0) activeIndex = 4;
        else if (current.data.year_value5 > 0) activeIndex = 5;
        else if (current.data.year_value6 > 0) activeIndex = 6;
        else if (current.data.year_value7 > 0) activeIndex = 7;

        await Actions.assignVariables(context, {
          $variables: {
            activeYearFieldIndex: activeIndex,
          },
        });

        // Load calendar year ranges
        await Actions.callChain(context, {
          chain: 'loadCalendarYearRangesAC',
          params: {
            calendarId: current.data.budget_year_id,
          },
        });

        await Actions.fireNotificationEvent(context, {
          summary: 'Edit Mode',
          message: 'Budget line loaded for editing',
          displayMode: 'transient',
          type: 'info',
        });

      } catch (error) {
        console.error('Error editing budget line:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load budget line for editing',
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return budgetEditAction;
});