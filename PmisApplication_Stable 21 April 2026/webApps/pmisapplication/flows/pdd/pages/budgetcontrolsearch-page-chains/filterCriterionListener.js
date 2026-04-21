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
      const { $page, $flow, $application, $constants, $variables, $tag } = context;


      let filters = {
        p_keyword: null,
        p_plan_type: null,
        p_year: null
    };
    if (!event || !event.value) {
        console.log("No event value found.");

        await Actions.resetVariables(context, {
          variables: [
    '$variables.searchObj',
  ],
        });

        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });
         
        return;
      } else {
      const processCriteria = (criteria) => {
        criteria.forEach(c => {
          switch (c.$tag) {
            case "PlanTypeFilter":
              filters.p_plan_type = c.value?.id || null;
              break;
            case "YearFilter":
              filters.p_year = c.value?.display_year || null;
              break;
          }
        });
      };

        if (event.value.$tag === "_root_") {
        processCriteria(event.value.criteria);
      } else {
        processCriteria([event.value]);
      }
      console.log("search filters:");
      console.log(filters.p_plan_type);
      console.log(filters.p_year);
      console.log(filters.p_tender_id);
 
      // Assign to page-level search filter variable
      Object.keys(filters).forEach(key => {
        $variables.searchObj[key] = filters[key] || "";
      });
 
     
      console.log("🔍 Smart search applied with filters:", filters);

        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });

      }
    }
  }

  return filterCriterionListener;
});
