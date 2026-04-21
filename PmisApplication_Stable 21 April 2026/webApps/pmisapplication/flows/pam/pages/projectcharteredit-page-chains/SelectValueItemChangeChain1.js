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

  class SelectValueItemChangeChain1 extends ActionChain {

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
      // $variables.projectCharterVar.project_number = data.budget_number;


      console.log("++++++++9199: ", JSON.stringify(valueItem));
      // if (!valueItem.data) {
      //   return;
      // }

      $variables.projectCharterVar.project_number = valueItem.data.budget_number;
       console.log("+++aaa+++++9199: ", $variables.projectCharterVar.project_number);
      $variables.projectCharterVar.project_name = valueItem.data.project_name;
    }
  }

  return SelectValueItemChangeChain1;
});
