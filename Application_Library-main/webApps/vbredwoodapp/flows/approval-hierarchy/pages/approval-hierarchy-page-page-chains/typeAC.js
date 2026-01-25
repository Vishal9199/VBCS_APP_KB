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

  class typeAC extends ActionChain {

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

      if (key === "EMPLOYEE") { //if Employee is Selected
        $variables.approvalHierarchyListVar.user_role_id = null;
      } else if (key === "USER_GROUP") { //if User Group is Selected
        $variables.approvalHierarchyListVar.user_id = null;
        $variables.approvalHierarchyListVar.person_id = null;
        $variables.approvalHierarchyListVar.user_name = null;
        $variables.approvalHierarchyListVar.person_number = null;
        $variables.approvalHierarchyListVar.person_name = null;
      }
        $variables.approvalHierarchyListVar.type_id = data.lookup_value_id;
        $variables.approvalHierarchyListVar.type_name = data.lookup_value_name;
    }
  }

  return typeAC;
});
