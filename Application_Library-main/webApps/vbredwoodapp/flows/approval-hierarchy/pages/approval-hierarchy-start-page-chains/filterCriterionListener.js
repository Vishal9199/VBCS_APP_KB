define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class filterCriterionListener extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{}} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables, $tag } = context;

      try {
        console.log("Filter Event ==> ", JSON.stringify(event.value));

        // Reset search object
        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj'],
        });

        // Local holders
        let l_hierarchy_code = '';
        let l_function_id = '';
        let l_business_unit_id = '';
        let l_keyword = '';

        if (event.value) {
          const data = event.value;

          // --- Root event (all filters applied together)
          if (data.$tag === "_root_" && Array.isArray(data.criteria)) {
            data.criteria.forEach(criteria => {
              switch (criteria.$tag) {
                case "HierarchyNameFilter":
                  l_hierarchy_code = criteria.value?.hierarchy_code ?? null;
                  break;
                case "FunctionNameFilter":
                  l_function_id = criteria.value?.function_id ?? null;
                  break;
                case "BusinessUnitFilter":
                  l_business_unit_id = criteria.value?.business_unit_id ?? null;
                  break;
                case "$keyword$":
                  l_keyword = criteria.text ?? null;
                  break;
              }
            });

            // --- Single filter event
          } else {
            switch (data.$tag) {
              case "HierarchyNameFilter":
                l_hierarchy_code = data.value?.hierarchy_code ?? null;
                break;
              case "FunctionNameFilter":
                l_function_id = data.value?.function_id ?? null;
                break;
              case "BusinessUnitFilter":
                l_business_unit_id = data.value?.business_unit_id ?? null;
                break;
              case "$keyword$":
                l_keyword = data.text ?? null;
                break;
            }
          }
        }

        // Assign values to search object
        $variables.searchObj.HIERARCHY_CODE = l_hierarchy_code;
        $variables.searchObj.FUNCTION_ID = l_function_id;
        $variables.searchObj.BUSINESS_UNIT_ID = l_business_unit_id;
        $variables.searchObj.KEYWORD = l_keyword;

        // Trigger search
        await Actions.callChain(context, {
          chain: 'searchAC',
        });

      } catch (error) {
        // console.error("Error in filterCriterionListener:", error);
      }
    }

  }

  return filterCriterionListener;
});