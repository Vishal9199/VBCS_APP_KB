
define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class filterCriterionListener extends ActionChain {
    async run(context, { event }) {
      const { $variables, $tag, $keyword, $ge, $le, $functions, $application, $page } = context;

      let filters = {
        P_RESTRICTION_CODE: null,
        P_PERSON_ID: null,
        P_KEYWORD: null
      };

      if (!event || !event.value) {
        console.log("No event value found.");

        await Actions.resetVariables(context, {
          variables: [
    '$page.variables.SearchObj',
  ],
        });
        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });
        return;
      }
      else {

        const processCriteria = (criteria) => {
          criteria.forEach(c => {
            switch (c.$tag) {
              case "RestrictionFilter":
                filters.P_RESTRICTION_CODE = c.value?.lookup_value_code || null;
                break;
              case "PersonFilter":
                filters.P_PERSON_ID = c.value?.full_name || null;
                break;
              case "$keyword$":
                filters.P_KEYWORD = c.text?.trim().toLowerCase();
            }
          });
        };



        if (event.value.$tag === "_root_") {
          processCriteria(event.value.criteria);
        } else {
          processCriteria([event.value]);
        }



        console.log("search filters:");
        console.log(filters.P_RESTRICTION_CODE);
        console.log(filters.P_PERSON_ID);
        console.log(filters.P_KEYWORD);




        // Assign to page-level search filter variable
        Object.keys(filters).forEach(key => {

          $variables.SearchObj[key] = filters[key] || "";

        });


        $variables.SearchObj.IN_OFFSET = '0';

        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });


        console.log("🔍 Smart search applied with filters:", filters);
      }

    }
  }


  return filterCriterionListener;
});