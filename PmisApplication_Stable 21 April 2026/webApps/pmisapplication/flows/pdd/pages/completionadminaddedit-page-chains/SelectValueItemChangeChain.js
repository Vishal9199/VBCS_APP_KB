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

  class SelectValueItemChangeChain extends ActionChain {

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

      $variables.completionVar.ora_project_id = data.project_id;

      $variables.completionVar.ora_project_name = data.project_name;

      $variables.completionVar.ora_project_number = data.project_number;

      $variables.completionVar.tender_name = data.tender_name;

      $variables.completionVar.tender_number = data.tender_number;

      $variables.completionVar.supplier_id = data.supplier_id;

      $variables.completionVar.supplier_name = data.supplier_name;
    }
  }

  return SelectValueItemChangeChain;
});
