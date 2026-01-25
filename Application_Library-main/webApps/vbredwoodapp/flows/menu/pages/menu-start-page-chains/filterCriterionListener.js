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
      const { $variables, $tag } = context;

      try {
      

        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj'],
        });

        
        let l_menu_id_from_name_filter = null;
           let l_keyword = '';

        if (event.value) {
          if (event.value.$tag === "_root_") {
            // Handle multiple filters at root level
            let data = event.value;

            data.criteria.forEach(criteria => {
              // For SelectSingleFilter with menu_id as value
            
              if (criteria.$tag === "MenuNameFilter" && criteria.value.menu_name) {
                l_menu_id_from_name_filter = criteria.value.menu_name; // This is menu_id
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

            if (data.$tag === "MenuNameFilter" && data.value.menu_name) {
              l_menu_id_from_name_filter = data.value.menu_name; // This is menu_id
            }
          }

          // Map to search object - use menu_id for both filters
          // You can choose to use either filter or combine them as needed
          let final_menu_id = l_menu_id_from_name_filter;
          
          $variables.searchObj.MENU_ID =+ final_menu_id;
          $variables.searchObj.KEYWORD =l_keyword;
        }
        await Actions.callChain(context, {
          chain: 'searchMenuDataAC',
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