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
              // For SelectSingleFilter with table_name
              if (criteria.$tag === "TableNameFilter" && criteria.value && criteria.value.table_name) {
                l_menu_id_from_name_filter = criteria.value.table_name;
              }
              // Handle keyword search
              if (criteria.$tag === "$keyword$" && criteria.text) {
                l_keyword = criteria.text;
              }
            });

          } else {
            // Handle single filter selection
            let data = event.value;
            
            // Handle keyword
            if (data.$tag === "$keyword$" && data.text) {
              l_keyword = data.text;
            }

            // Handle TableNameFilter - FIXED TYPO HERE
            if (data.$tag === "TableNameFilter" && data.value && data.value.table_name) {
              l_menu_id_from_name_filter = data.value.table_name;
            }
          }

          // Assign to search object
          if (l_menu_id_from_name_filter) {
            $variables.searchObj.TABLE_NAME = l_menu_id_from_name_filter;
          }
          
          // If you want to use keyword search too
          if (l_keyword) {
            $variables.searchObj.KEYWORD = l_keyword; // Add this field to your searchObj variable
          }
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