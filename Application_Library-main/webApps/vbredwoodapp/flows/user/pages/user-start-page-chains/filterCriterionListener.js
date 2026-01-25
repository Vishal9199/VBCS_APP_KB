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
      const { $variables, $tag, $keyword, $ge, $le } = context;

      await Actions.resetVariables(context, {
        variables: ['$variables.userSearch'],
      });

      let l_user_id = null;
      let l_effective_start_date = null;
      let l_effective_end_date = null;
      let l_keyword = null;

      if (event.value) {
        let data = event.value;

        if (data.$tag === "_root_") {
          data.criteria.forEach(criteria => {
            if (criteria.$tag === "UserNameFilter" && criteria.value.user_id) {
              l_user_id = criteria.value.user_id;
            }

            if (criteria.$tag === "$keyword$" && criteria.text) {
              l_keyword = criteria.text;
            }

            if (criteria.$tag === "EndDateRangeFilter" && Array.isArray(criteria.criteria)) {
              criteria.criteria.forEach(subCriteria => {
                if (subCriteria.op === "$ge") {
                  l_effective_start_date = subCriteria.value.EFFECTIVE_END_DATE;
                } else if (subCriteria.op === "$le") {
                  l_effective_end_date = subCriteria.value.EFFECTIVE_END_DATE;
                }
              });
            }
          });
        } else {
          // single criteria event
          if (data.$tag === "UserNameFilter" && data.value?.user_id) {
            l_user_id = data.value.user_id;
          }

          if (data.$tag === "$keyword$" && typeof data.text === 'string') {
            l_keyword = data.text;
          }

          if (data.$tag === "EndDateRangeFilter" && Array.isArray(data.criteria)) {
            data.criteria.forEach(criteriaItem => {
              if (criteriaItem.op === "$ge") {
                l_effective_start_date = criteriaItem.value.EFFECTIVE_END_DATE;
              } else if (criteriaItem.op === "$le") {
                l_effective_end_date = criteriaItem.value.EFFECTIVE_END_DATE;
              }
            });
          }
        }

        // set variables
        $variables.userSearch.USER_ID = l_user_id;
        $variables.userSearch.EFFECTIVE_START_DATE = l_effective_start_date;
        $variables.userSearch.EFFECTIVE_END_DATE = l_effective_end_date;
        $variables.userSearch.KEYWORD = l_keyword;

        // trigger search
        await Actions.callChain(context, { chain: 'searchDataAC' });
      }

      // trigger search
      await Actions.callChain(context, { chain: 'searchDataAC' });
    }
  }

  return filterCriterionListener;
});
