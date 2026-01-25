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

  class dateTypeAC extends ActionChain {

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
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      $variables.fieldTypeArray = [];

      if (key === 'NUMBER') {
        $variables.parameterVar.field_type = 'NUMBER';
      } else if (key === 'DATE') {
        $variables.parameterVar.field_type = 'DATE';
      }


      $variables.fieldTypeArray = await $functions.getFieldTypeArray(key);
      

    }
  }

  return dateTypeAC;
});
