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
     * @param {{oldValue:any,value:any}} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;
      try {
        console.log("Filter Event ==> ", JSON.stringify(event.value));

        // Local holders
        let l_schedule_id = '';
        let l_schedule_name = '';
        let l_keyword = '';

        if (event.value) {
          const data = event.value;

          // --- Root event (all filters applied together)
          if (data.$tag === "_root_" && Array.isArray(data.criteria)) {
            data.criteria.forEach(criteria => {
              switch (criteria.$tag) {
                case "ScheduleNameFilter":
                  l_schedule_id = criteria.value?.schedule_id ?? null;
                  l_schedule_name = criteria.value?.schedule_name ?? null;
                  break;
                case "$keyword$":
                  l_keyword = criteria.text ?? null;
                  break;
              }
            });

            // --- Single filter event
          } else {
            switch (data.$tag) {
              case "ScheduleNameFilter":
                l_schedule_id = data.value?.schedule_id ?? null;
                l_schedule_name = data.value?.schedule_name ?? null;
                break;
              case "$keyword$":
                l_keyword = data.text ?? null;
                break;
            }
          }
        }

        // Assign values to search object
        $variables.searchObj.SCHEDULE_ID = l_schedule_id || "";
        $variables.searchObj.SCHEDULE_NAME = l_schedule_name || "";
        // $variables.searchObj.KEYWORD = l_keyword || "";

        // Trigger search
        await Actions.callChain(context, {
          chain: 'searchAC',
        });

      } catch (error) {
        console.error("Error in filterCriterionListener:", error);
      }
    }
  }

  return filterCriterionListener;
});
