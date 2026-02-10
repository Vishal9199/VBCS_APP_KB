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
        console.log("FilterCriterion Event ==> " + JSON.stringify(event.value));
        
        await Actions.resetVariables(context, {
          variables: [
            '$variables.searchObj',
          ],
        });

        let l_tender_number = null;
        let l_project_number = null;
        let l_project_name = null;
        let l_from_date = null;
        let l_to_date = null;

        if (event.value) {
          if (event.value.$tag === "_root_") {
            let data = event.value;
            data.criteria.forEach(criteria => {
              
              if (criteria.$tag === "TenderNumberFilter" && criteria.text) {
                l_tender_number = criteria.text;
              }

              if (criteria.$tag === "ProjectNumberFilter" && criteria.text) {
                l_project_number = criteria.text;
              }

              if (criteria.$tag === "ProjectNameFilter" && criteria.text) {
                l_project_name = criteria.text;
              }

              if (criteria.$tag === "DateRangeFilter" && Array.isArray(criteria.criteria)) {
                for (const subCriteria of criteria.criteria) {
                  if (subCriteria.op === "$ge") {
                    l_from_date = subCriteria.value.created_date;
                  } else if (subCriteria.op === "$le") {
                    l_to_date = subCriteria.value.created_date;
                  }
                }
              }
            });

            console.log("Root Level => Tender Number:", l_tender_number);
            console.log("Root Level => Project Number:", l_project_number);
            console.log("Root Level => Project Name:", l_project_name);
            console.log("Root Level => From Date:", l_from_date);
            console.log("Root Level => To Date:", l_to_date);

            $variables.searchObj.P_TENDER_NUMBER = l_tender_number;
            $variables.searchObj.P_PROJECT_NUMBER = l_project_number;
            $variables.searchObj.P_PROJECT_NAME = l_project_name;
            $variables.searchObj.P_FROM_DATE = l_from_date;
            $variables.searchObj.P_TO_DATE = l_to_date;

          } else {
            let data = event.value;
            
            if (data.$tag === "TenderNumberFilter" && typeof data.text === 'string') {
              l_tender_number = data.text;
            }

            if (data.$tag === "ProjectNumberFilter" && typeof data.text === 'string') {
              l_project_number = data.text;
            }

            if (data.$tag === "ProjectNameFilter" && typeof data.text === 'string') {
              l_project_name = data.text;
            }

            if (data.$tag === "DateRangeFilter" && Array.isArray(data.criteria)) {
              data.criteria.forEach(criteriaItem => {
                if (criteriaItem.$tag === "DateRangeFilter" && criteriaItem.value && criteriaItem.value.created_date) {
                  if (criteriaItem.op === "$ge") {
                    l_from_date = criteriaItem.value.created_date;
                  } else if (criteriaItem.op === "$le") {
                    l_to_date = criteriaItem.value.created_date;
                  }
                }
              });
            }

            console.log("Single Level => Tender Number:", l_tender_number);
            console.log("Single Level => Project Number:", l_project_number);
            console.log("Single Level => Project Name:", l_project_name);
            console.log("Single Level => From Date:", l_from_date);
            console.log("Single Level => To Date:", l_to_date);

            $variables.searchObj.P_TENDER_NUMBER = l_tender_number;
            $variables.searchObj.P_PROJECT_NUMBER = l_project_number;
            $variables.searchObj.P_PROJECT_NAME = l_project_name;
            $variables.searchObj.P_FROM_DATE = l_from_date;
            $variables.searchObj.P_TO_DATE = l_to_date;
          }
        }
      } catch (error) {
        console.error("Error in filterCriterionListener:", error);
      }

    }
  }

  return filterCriterionListener;
});