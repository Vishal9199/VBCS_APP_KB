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

      $variables.approvalHierarchyListVar.person_id = data.person_id;
      $variables.approvalHierarchyListVar.person_name = data.person_name;
      $variables.approvalHierarchyListVar.person_number = data.person_number;
      $variables.approvalHierarchyListVar.user_name = data.user_name;
      
    }
  }

  return userAC;
});
