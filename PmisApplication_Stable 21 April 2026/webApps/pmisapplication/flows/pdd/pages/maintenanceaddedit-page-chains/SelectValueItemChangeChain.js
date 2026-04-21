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

      $variables.maintenanceadminSearchVar.ora_project_id = data.project_id;

      $variables.maintenanceadminSearchVar.ora_project_name = data.project_name;

      $variables.maintenanceadminSearchVar.ora_project_number = data.project_number;

      $variables.maintenanceadminSearchVar.tender_name = data.tender_name;

      $variables.maintenanceadminSearchVar.tender_number = data.tender_number;

      $variables.maintenanceadminSearchVar.supplier_id = data.supplier_id;

      $variables.maintenanceadminSearchVar.supplier_name = data.supplier_name;
    }
  }

  return SelectValueItemChangeChain;
});
