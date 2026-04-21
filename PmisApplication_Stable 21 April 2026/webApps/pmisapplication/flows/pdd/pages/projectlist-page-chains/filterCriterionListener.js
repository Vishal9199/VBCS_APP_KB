define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class filterCriterionListener extends ActionChain {
    async run(context, { event }) {
      const { $variables } = context;
      try {
        await Actions.resetVariables(context, { variables: ['$variables.searchObj'] });

        const filters = {
          p_ora_project_id: null,
          p_project_id: null,
          p_keyword: null
        };

        if (!event || !event.value) {
          $variables.searchObj.in_offset = '0';
          await Actions.callChain(context, { chain: 'vbAfterNavigateListener' });
          return;
        }

        const processCriteria = (criteria) => {
          criteria.forEach(c => {
            switch (c.$tag) {
              case 'ProjectlistOraProjectNameFilter':
                console.log("SM 001 c.$tag 1", JSON.stringify(c.$tag));
                console.log("SM 001 c 1", JSON.stringify(c));
                if (c.value && c.value.ora_project_id) filters.p_ora_project_id = c.value.ora_project_id;
                break;
              case 'ProjectlistProjectFilter':
                console.log("SM 001 c.$tag 2", JSON.stringify(c.$tag));
                console.log("SM 001 c 2", JSON.stringify(c));
                if (c.value && c.value.project_id) filters.p_project_id = c.value.project_id;
                break;
              case '$keyword$':
                filters.p_keyword = c.text ? c.text.trim() : null;
                break;
            }
          });
        };

        if (event.value.$tag === '_root_') {
          processCriteria(event.value.criteria);
        } else {
          processCriteria([event.value]);
        }

        $variables.searchObj.p_ora_project_id = filters.p_ora_project_id || '';
        $variables.searchObj.p_project_id = filters.p_project_id || '';
        $variables.searchObj.p_keyword = filters.p_keyword || '';
        $variables.searchObj.in_offset = '0';

        await Actions.callChain(context, { chain: 'vbAfterNavigateListener' });

      } catch (err) {
        console.error('❌ Error in filterCriterionListener:', err);
      }
    }
  }

  return filterCriterionListener;
});