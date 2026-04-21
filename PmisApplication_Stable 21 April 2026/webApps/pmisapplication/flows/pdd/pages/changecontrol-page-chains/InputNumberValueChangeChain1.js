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

  class InputNumberValueChangeChain1 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {number} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, previousValue, value, updatedFrom, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const calculateChangeValues = await $functions.calculateChangeValues($variables.lvCurrentChangeControlRow.addition_a, $variables.lvCurrentChangeControlRow.omission_b, $variables.original_contract_value);

      $variables.lvCurrentChangeControlRow.total_change = calculateChangeValues.total_change;

      $variables.lvCurrentChangeControlRow.net_change = calculateChangeValues.net_change;

      $variables.lvCurrentChangeControlRow.net_percentage_of_change = calculateChangeValues.net_percentage_of_change;

      $variables.lvCurrentChangeControlRow.total_vol_of_change = calculateChangeValues.total_vol_of_change;
    }
  }

  return InputNumberValueChangeChain1;
});
