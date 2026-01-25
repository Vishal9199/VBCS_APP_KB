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

        // Reset search object
        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj'],
        });

        // Local holders
        let l_approval_role_code = '';
        let l_keyword = '';

        if (event.value) {
          const data = event.value;

          // --- Root event (all filters applied together)
          if (data.$tag === "_root_" && Array.isArray(data.criteria)) {
            data.criteria.forEach(criteria => {
              switch (criteria.$tag) {
                case "ApprovalRoleNameFilter":
                  l_approval_role_code = criteria.value?.approval_role_code ?? null;
                  break;
                case "$keyword$":
                  l_keyword = criteria.text ?? null;
                  break;
              }
            });

            // --- Single filter event
          } else {
            switch (data.$tag) {
              case "ApprovalRoleNameFilter":
                l_approval_role_code = data.value?.approval_role_code ?? null;
                break;
              case "$keyword$":
                l_keyword = data.text ?? null;
                break;
            }
          }
        }

        // Assign values to search object
        $variables.searchObj.APPROVAL_ROLE_CODE = l_approval_role_code;
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