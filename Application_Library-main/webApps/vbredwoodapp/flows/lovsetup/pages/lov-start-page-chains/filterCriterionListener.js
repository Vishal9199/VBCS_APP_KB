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

      try {
        console.log("Filter Criterion Event: ", JSON.stringify(event.value));

        let l_lov_config_id = '';
        let l_lov_type = '';
        let l_keyword = '';

        if (event.value) {
          const data = event.value;

          if (data.$tag === '_root_') {
            // Handle multiple filters
            data.criteria.forEach(criteria => {
              // LOV Name filter (LovFilter)
              if (criteria.$tag === "LovFilter" && criteria.value?.lov_config_id) {
                l_lov_config_id = criteria.value.lov_config_id;
              }

              // LOV Type filter (LovTypeFilter)
              if (criteria.$tag === "LovTypeFilter" && criteria.value?.lov_type) {
                l_lov_type = criteria.value.lov_type;
              }

              // Keyword filter (tag: $keyword$, text: '...')
              if (criteria.$tag === "$keyword$" && criteria.text) {
                l_keyword = criteria.text;
              }
            });

            console.log("Root Level - LOV Config ID:", l_lov_config_id);
            console.log("Root Level - LOV Type:", l_lov_type);
            console.log("Root Level - Keyword:", l_keyword);

          } else {
            // Handle single filter case
            if (data.$tag === "LovFilter" && data.value && typeof data.value === 'object') {
              l_lov_config_id = data.value.lov_config_id || '';
            }

            if (data.$tag === "LovTypeFilter" && data.value && typeof data.value === 'object') {
              l_lov_type = data.value.lov_type || '';
            }

            if (data.$tag === "$keyword$" && typeof data.text === 'string') {
              l_keyword = data.text;
            }

            console.log("Single Filter - LOV Config ID:", l_lov_config_id);
            console.log("Single Filter - LOV Type:", l_lov_type);
            console.log("Single Filter - Keyword:", l_keyword);
          }

        }
        // Update search object with filter values
        $variables.searchObj.p_lov_config_id = l_lov_config_id;
        $variables.searchObj.p_lov_type = l_lov_type;
        $variables.searchObj.p_keyword = l_keyword;

        // Reset pagination for new search
        $variables.searchObj.in_offset = 0;

        console.log("Updated searchObj:", JSON.stringify($variables.searchObj, null, 2));

        // Call search action chain to execute the search
        await Actions.callChain(context, {
          chain: 'searchAC',
        });
      } catch (error) {
        console.error("Error in filterCriterionListener:", error);

        // Fire error notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Filter Error',
          message: 'An error occurred while applying filters. Please try again.',
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return filterCriterionListener;
});