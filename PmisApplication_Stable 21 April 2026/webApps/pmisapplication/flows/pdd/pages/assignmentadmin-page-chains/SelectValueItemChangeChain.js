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
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, previousValue, value, updatedFrom, key, data, metadata, valueItem, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;


      $variables.postAssignmentVar.tender_number = data.tender_number;
      $variables.postAssignmentVar.ora_project_id = data.ora_project_id;
      $variables.postAssignmentVar.project_id = data.project_id;
      $variables.postAssignmentVar.ora_project_number = data.ora_project_number;
      $variables.postAssignmentVar.tender_id = data.tender_id;
    }
  }

  return SelectValueItemChangeChain;
});
