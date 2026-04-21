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

  class onLovDialogRefNumValue extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     * @param {any} params.key
     * @param {any} params.data
     * @param {any} params.metadata
     * @param {any} params.valueItem
     */
    async run(context, { event, previousValue, value, updatedFrom, key, data, metadata, valueItem }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (value !== null && value !== 'undefined') {
        $variables.passProjectDtlsVar.mpName = data.mp_ref_plan_name;
        $variables.passProjectDtlsVar.mpRefId = key;
        $variables.passProjectDtlsVar.refNum = data.mp_ref_num;
        $variables.passProjectDtlsVar.budgetCal = data.budget_year_id;
      }
    }
  }

  return onLovDialogRefNumValue;
});
