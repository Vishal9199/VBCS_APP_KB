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

  class onApprovalGroupChanged extends ActionChain {

    /**
     * Populates selectedApprovalGroup from the LOV selection.
     * Triggered when the user picks an approval type from the selectgroup ADP.
     * 
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.value - valueItem from oj-select-single
     * @param {any} params.valueItem
     * @param {any} params.metadata
     * @param {any} params.data
     * @param {any} params.key
     * @param {string} params.updatedFrom
     * @param {any} params.previousValue
     * @param {object} params.event
     */
    async run(context, { value, valueItem, metadata, data, key, updatedFrom, previousValue, event }) {
      const { $variables } = context;

      await Actions.resetVariables(context, {
        variables: [
    '$variables.updateAction.P_NEXT_APPROVER_ID',
  ],
      });

      if (value && value.data) {
        $variables.selectedApprovalGroup.p_appr_level = value.data.level_num;

        $variables.selectedApprovalGroup = {
          hierarchy_list_id: value.data.hierarchy_list_id,
          p_appr_level: value.data.level_num,
          approval_role_code: value.data.approval_role_code,
          user_role_name: value.data.user_role_name,
          user_role_id: value.data.user_role_id,
        };
      } else {
        $variables.selectedApprovalGroup = {};
      }

      await Actions.fireDataProviderEvent(context, {
        refresh: null,
        target: $variables.nextApproverLovSDP,
      });
    }
  }

  return onApprovalGroupChanged;
});