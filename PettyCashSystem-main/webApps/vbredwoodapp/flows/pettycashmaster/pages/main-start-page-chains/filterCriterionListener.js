define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class filterCriterionListener extends ActionChain {
    async run(context, { event }) {
      const { $variables, $tag, $keyword, $ge, $le, $functions, $application, $page } = context;

      let filters = {
        p_app_type: 'EMP',
        p_created_by: null,
        p_keyword: null,
        p_status_id: null,
        p_claim_header_id: null,
        p_claim_number: null,
        p_governorate: null,
        p_petty_cash_type: null,
        p_supplier_id: null,
        p_supplier_name: null,
        p_from_date: null,
        p_to_date: null
      };

      if (!event || !event.value) {
        console.log("No event value found.");

        await Actions.resetVariables(context, {
          variables: [
            '$page.variables.SearchObj',
          ],
        });
        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener',
        });
        return;
      }
      else {

        const processCriteria = (criteria) => {
          criteria.forEach(c => {
            switch (c.$tag) {
              case "GovernateFilter":
                filters.p_governorate = c.value?.petty_cash_governate || null;
                break;
              case "SupplierNameFilter":
                filters.p_supplier_name = c.value?.supplier_name || null;
                break;
              case "StatusFilter":
                filters.p_status_id = c.value?.lookup_value_id || null;
                break;
              case "DateFilter":
                // filters.p_from_date = c.value?.request_date|| null;
                // filters.p_to_date = c.value?.request_date|| null;
                // break;
                if (Array.isArray(c.criteria)) {
                  c.criteria.forEach(subCriteria => {
                    if (subCriteria.op === "$ge") {
                      // Greater than or equal = FROM date
                      filters.p_from_date = subCriteria.value?.request_date || null;
                    } else if (subCriteria.op === "$le") {
                      // Less than or equal = TO date
                      filters.p_to_date = subCriteria.value?.request_date || null;
                    }
                  });
                }
                break;
              case "$keyword$":
                filters.p_keyword = c.text?.trim().toLowerCase() || null;
                break;
            }
          });
        };

        if (event.value.$tag === "_root_") {
          processCriteria(event.value.criteria);
        } else {
          processCriteria([event.value]);
        }

        console.log("search filters:");
        console.log("p_governorate:", filters.p_governorate);
        console.log("p_supplier_name:", filters.p_supplier_name);
        console.log("p_from_date:", filters.p_from_date);
        console.log("p_to_date:", filters.p_to_date);
        console.log("p_keyword:", filters.p_keyword);

        // Assign to page-level search filter variable
        Object.keys(filters).forEach(key => {
          $variables.SearchObj[key] = filters[key] || "";
        });

        $variables.SearchObj.IN_OFFSET = '0';

        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener',
        });

        console.log("🔍 Smart search applied with filters:", filters);
      }
    }
  }
  return filterCriterionListener;
});