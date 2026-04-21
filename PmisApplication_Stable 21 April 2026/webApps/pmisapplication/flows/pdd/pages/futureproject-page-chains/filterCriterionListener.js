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

    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log('filterCriterionListener ==> ' + JSON.stringify(event.value));

        // Preserve IN_LIMIT; always reset to page 1 on new filter
        const currentLimit = $variables.searchObj.in_limit || '30';

        await Actions.resetVariables(context, {
          variables: ['$variables.searchObj'],
        });

        $variables.searchObj.in_limit  = currentLimit;
        $variables.searchObj.in_offset = '0';

        let l_senior_mgr_usr_id = null;
        let l_project_mgr_id    = null;
        let l_region_name       = null;
        let l_year              = null;
        let l_type              = null;
        let l_keyword           = null;

        if (event.value) {
          if (event.value.$tag === '_root_') {
            event.value.criteria.forEach(criteria => {
              if (criteria.$tag === 'YearFilter' && criteria.value != null) {
                // value is a LOV object { display_year: '2025' } — extract the field
                l_year = criteria.value.year ?? criteria.text ?? criteria.value;
              }
              if (criteria.$tag === 'PlanTypeFilter' && criteria.value != null) {
                // value is a LOV object { label: 'P1', value: 'P1' } — extract value field
                l_type = criteria.value.type ?? criteria.text ?? criteria.value;
              }
              if (criteria.$tag === '$keyword$' && criteria.text) {
                l_keyword = criteria.text;
              }
            });

          } else {
            const data = event.value;
            if (data.$tag === 'YearFilter' && data.value != null) {
              // value is a LOV object { display_year: '2025' } — extract the field
              l_year = data.value.year ?? data.text ?? data.value;
            }
            if (data.$tag === 'PlanTypeFilter' && data.value != null) {
              // value is a LOV object { label: 'P1', value: 'P1' } — extract value field
              l_type = data.value.type ?? data.text ?? data.value;
            }
            if (data.$tag === '$keyword$' && typeof data.text === 'string') {
              l_keyword = data.text;
            }
          }

          $variables.searchObj.p_senior_mgr_usr_id = l_senior_mgr_usr_id ? String(l_senior_mgr_usr_id) : '';
          $variables.searchObj.p_project_mgr_id    = l_project_mgr_id    ? String(l_project_mgr_id)    : '';
          $variables.searchObj.p_region_id         = l_region_name       ? String(l_region_name)       : '';
          $variables.searchObj.p_year              = l_year              ? String(l_year)              : '';
          $variables.searchObj.p_type              = l_type              ? String(l_type)              : '';
          $variables.searchObj.p_keyword           = l_keyword           ? String(l_keyword)           : '';

          // Log decrypted payload being sent to DB
          console.log('searchObj (decrypted payload) ==> ' + JSON.stringify($variables.searchObj));

          // Trigger search after filter change
          await Actions.callChain(context, { chain: 'SynADPFutureProjectsAC' });
        }

      } catch (error) {
        console.error('filterCriterionListener error ==> ' + error);
      }
    }
  }

  return filterCriterionListener;
});