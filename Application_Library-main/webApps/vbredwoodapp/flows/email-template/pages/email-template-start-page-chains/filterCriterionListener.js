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
        let l_template_name = '';
        let l_keyword = '';

        if (event.value) {
          const data = event.value;

          // --- Root event (all filters applied together)
          if (data.$tag === "_root_" && Array.isArray(data.criteria)) {
            data.criteria.forEach(criteria => {
              switch (criteria.$tag) {
                case "HeaderTemplateNameFilter":
                  l_template_name = criteria.value?.template_code ?? null;
                  break;
                case "$keyword$":
                  l_keyword = criteria.text ?? null;
                  break;
              }
            });

          // --- Single filter event
          } else {
            switch (data.$tag) {
              case "HeaderTemplateNameFilter":
                l_template_name = data.value?.template_code ?? null;
                
                break;
              case "$keyword$":
                l_keyword = data.text ?? null;
                break;
            }
          }
        }

        // Assign values to search object
        $variables.searchObj.TEMPLATE_CODE = l_template_name;
        $variables.searchObj.KEYWORD = l_keyword;

        console.log("Search Object ==> ", JSON.stringify($variables.searchObj));

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