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
      const { $page, $flow, $application, $constants, $variables, $tag, $keyword } = context;

      let l_applicationCode = '';
      let l_keyword = '';

      if (event.value) {
        const data = event.value;

        if (data.$tag === '_root_') {
          // Handle multiple filters
          data.criteria.forEach(criteria => {
            // Keyword filter (tag: $keyword$, value: { text: '...' })
            if (criteria.$tag === "$keyword$" && criteria.text) {
              l_keyword = criteria.text;
            }

            if (criteria.$tag === "ApplicationNameFilter" && criteria.value?.applicationName) {
              l_applicationCode = criteria.value.applicationName;
            }
          });
        } else {
          // Handle single filter case
          if (data.$tag === "$keyword$" && data.text) {
            l_keyword = data.text;
          }

          if (data.$tag === "ApplicationNameFilter" && data.value?.applicationName) {
            l_applicationCode = data.value.applicationName;
          }
        }


        // console.log("Updated searchParams:", JSON.stringify($variables.searchObj, null, 2));

      }
      $variables.searchObj.APPLICATION_CODE = l_applicationCode;
      $variables.searchObj.KEYWORD = l_keyword;
      await Actions.callChain(context, {
        chain: 'searchAC',
      });
    }
  }

  return filterCriterionListener;
});
