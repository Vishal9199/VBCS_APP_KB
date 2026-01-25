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
      const { $variables, $tag, $keyword } = context;
        
        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj'],
        });
       
        let l_application_id = null;
        let l_role_code = null;
        let l_menu_id = null;
        let l_keyword = '';

        if (event.value) {
          if (event.value.$tag === "_root_") {
            // Handle multiple filters at root level
            let data = event.value;
            data.criteria.forEach(criteria => {
              
              // RoleNameFilter - field maps to role_code
              if (criteria.$tag === "RoleNameFilter" && criteria.value && criteria.value.role_code) {
                l_role_code = criteria.value.role_code;
              }
              
              // MenuNameFilter - field maps to menu_id
              if (criteria.$tag === "MenuNameFilter" && criteria.value && criteria.value.menu_id) {
                l_menu_id = criteria.value.menu_id;
              }
              
              // ApplicationNameFilter - field maps to application_id
              if (criteria.$tag === "ApplicationNameFilter" && criteria.value && criteria.value.application_id) {
                l_application_id = criteria.value.application_id;
              }
              
              // Keyword search
              if (criteria.$tag === "$keyword$" && criteria.text) {
                l_keyword = criteria.text;
              }
            });
         
          } else {
            // Handle single filter selection
            let data = event.value;
            
            // Keyword search
            if (data.$tag === "$keyword$" && data.text) {
              l_keyword = data.text;
            }
            
            // RoleNameFilter - field maps to role_code
            if (data.$tag === "RoleNameFilter" && data.value && data.value.role_code) {
              l_role_code = data.value.role_code;
            }
            
            // MenuNameFilter - field maps to menu_id
            if (data.$tag === "MenuNameFilter" && data.value && data.value.menu_id) {
              l_menu_id = data.value.menu_id;
            }
            
            // ApplicationNameFilter - field maps to application_id
            if (data.$tag === "ApplicationNameFilter" && data.value && data.value.application_id) {
              l_application_id = data.value.application_id;
            }
          }
          
          // Map to search object parameters
          $variables.searchObj.ROLE_CODE = l_role_code;
          $variables.searchObj.MENU_ID = l_menu_id;
          $variables.searchObj.APPLICATION_ID = l_application_id;
          $variables.searchObj.KEYWORD = l_keyword;
        }

      await Actions.callChain(context, {
        chain: 'searchDataAC',
      });
        

    }
  }

  return filterCriterionListener;
});