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
      const { $page, $flow, $application, $constants, $variables, $tag, $keyword, $ge, $le } = context;

      try {
        console.log("==>" + JSON.stringify(event.value));
        await Actions.resetVariables(context, {
          variables: [
            '$variables.searchObj',
          ],
        });

        let l_program_type = null;
        let l_keyword = null;

        if (event.value) {
          if (event.value.$tag === "_root_") {
            let data = event.value;
            data.criteria.forEach(criteria => {
              if (criteria.$tag === "ProgramTypeFilter" && criteria.value.program_type) {
                l_program_type = criteria.value.program_type;
              }

              if (criteria.$tag === "$keyword$" && criteria.text) {
                l_keyword = criteria.text;
              }
            });

            console.log("11=>l_program_type", l_program_type);
            console.log("11=>l_keyword", l_keyword);



          } else {
            let data = event.value;
            if (data.$tag === "ProgramTypeFilter" && data.value && typeof data.value === 'object') {
              l_program_type = data.value.program_type ?? null;
            }

            if (data.$tag === "$keyword$" && typeof data.text === 'string') {
              l_keyword = data.text;
            }

            console.log("22=>l_program_type", l_program_type);
            console.log("22=>l_keyword", l_keyword);





          }
        }

        $variables.searchObj.p_program_type = l_program_type;
        $variables.searchObj.p_keyword = l_keyword;


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