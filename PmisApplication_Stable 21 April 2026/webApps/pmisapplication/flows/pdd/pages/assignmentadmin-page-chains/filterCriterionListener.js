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
      const { $page, $flow, $application, $constants, $variables, $tag, $keyword, $ge, $le } = context;


      $variables.searchObj.in_offset = '0';

      let filters = {
        p_tender_id:null,
        p_ora_project_id:null
      };

      if (!event || !event.value) {
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
            case "TenderNumberFilter":
              filters.p_tender_id = c.value?.tender_id || null;
              break;
			  case "ProjectNumberFilter":
              filters.p_ora_project_id = c.value?.project_id || null;
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
      console.log(filters.p_tender_id);
      console.log(filters.p_ora_project_id);
 
 
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