define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class riskBeforeRowEditChain extends ActionChain {

    async run(context, { rowKey, rowIndex, rowData }) {
      const { $variables } = context;

      // lvCurrentRow is plain "object" type — prevents VBCS type coercion
      // that would convert numbers back to strings for oj-select-single bindings
      $variables.lvCurrentRow = {
        ...rowData,
        risk_id:            parseInt(rowData.risk_id)            || null,
        object_version_num: parseInt(rowData.object_version_num) || 1,
        ora_project_id:     parseInt(rowData.ora_project_id)     || null,
        tender_id:          parseInt(rowData.tender_id)          || null,
        risk_number:        parseInt(rowData.risk_number)        || null,
        risk_category_id:   parseInt(rowData.risk_category_id)   || null,
        likelihood_id:      parseInt(rowData.likelihood_id)      || null,
        scope:              parseInt(rowData.scope)              || null,
        time:               parseInt(rowData.time)               || null,
        cost:               parseInt(rowData.cost)               || null,
        qhse:               parseInt(rowData.qhse)               || null,
        owner_id:           parseInt(rowData.owner_id)           || null,
      };

      console.log('riskBeforeRowEditChain: row loaded, key=', rowKey);
    }
  }

  return riskBeforeRowEditChain;
});