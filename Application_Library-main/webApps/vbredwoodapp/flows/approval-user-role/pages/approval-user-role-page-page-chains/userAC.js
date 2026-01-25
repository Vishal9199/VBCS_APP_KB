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

  class userAC extends ActionChain {

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
      
      $variables.approvalRoleUserVar.person_id = data.person_id;
      $variables.approvalRoleUserVar.person_name = data.person_name;
      $variables.approvalRoleUserVar.person_number = data.person_number;
      $variables.approvalRoleUserVar.user_id = data.user_id;
      $variables.approvalRoleUserVar.user_name = data.user_name;

    }
  }

  return userAC;
});
