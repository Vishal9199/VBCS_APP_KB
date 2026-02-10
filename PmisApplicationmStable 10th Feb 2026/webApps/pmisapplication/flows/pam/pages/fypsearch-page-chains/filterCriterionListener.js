define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';
 
  class filterCriterionListener extends ActionChain {
    async run(context, { event }) {
      const { $variables ,$tag, $keyword, $ge, $le, $functions } = context;
 
		
	   $variables.searchObj.in_offset = '0';
	   
       let filters = {
        p_category_id: null,
        p_keyword: null,
        p_fy_plan_id: null,
        p_region_id: null,
        p_region_name: null,
        p_project_id: null,
        p_project_name: null,
        p_budget_number: null,
        p_status: null
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
      }
      else{
   
      const processCriteria = (criteria) => {
        criteria.forEach(c => {
          switch (c.$tag) {
            case "FyPlanNameFilter":
              filters.p_fy_plan_id = c.value?.fy_plan_id || null;
              break;
            case "RegionNameFilter":
              filters.p_region_id = c.value?.lookup_value_id || null;
              break;
			case "ProjectNameFilter":
              filters.p_project_id = c.value?.project_id || null;
              break;
			case "BudgetNumberFilter":
              filters.p_budget_number = c.value?.budget_number || null;
              break;
			case "CategoryFilter":
              filters.p_category_id = c.value?.lookup_value_id || null;
              break;
			case "StatusFilter":
              filters.p_status = c.value?.id || null;
              break;
            case "$keyword$":
              filters.p_keyword = c.text?.trim().toLowerCase();
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
      console.log(filters.p_fy_plan_id);
      console.log(filters.p_region_id);
      console.log(filters.p_project_id);
      console.log(filters.p_budget_number);
      console.log(filters.p_category_id);
      console.log(filters.p_status);
 
 
     
      
 
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