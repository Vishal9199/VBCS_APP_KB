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
      const { $variables } = context;

      try {
        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj'],
        });

        let l_application_name = null;
        let l_function_name = null;
           let l_keyword = '';

        if (event.value) {
          if (event.value.$tag === "_root_") {
            // Handle multiple filters at root level
            let data = event.value;

            data.criteria.forEach(criteria => {
              if (criteria.$tag === "ApplicationNameFilter" && criteria.value && criteria.value.application_name) {
                l_application_name = criteria.value.application_name;
              }

              if (criteria.$tag === "FunctionNameFilter" && criteria.value && criteria.value.function_name) {
                l_function_name = criteria.value.function_name;
              }
                if (criteria.$tag === "$keyword$" && criteria.text) {
              l_keyword = criteria.text;
            }
            });

          } else {
            // Handle single filter selection
            let data = event.value;
            if (data.$tag === "$keyword$" && data.text) {
            l_keyword = data.text;
          }


            if (data.$tag === "ApplicationNameFilter" && data.value && typeof data.value === 'object') {
              l_application_name = data.value.application_name ?? "";
            }

            if (data.$tag === "FunctionNameFilter" && data.value && typeof data.value === 'object') {
              l_function_name = data.value.function_name ?? "";
            }

           
          }

          

          // Map to search object
        $variables.searchObj.KEYWORD =l_keyword;
          $variables.searchObj.APPLICATION_ID = l_application_name;
          $variables.searchObj.FUNCTION_NAME = l_function_name;
        
        }

        // Execute search with updated parameters
        await Actions.callChain(context, {
          chain: 'searchDataAC',
        });
      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Search Filter Error',
          message: 'An error occurred while processing search filters: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return filterCriterionListener;
});
