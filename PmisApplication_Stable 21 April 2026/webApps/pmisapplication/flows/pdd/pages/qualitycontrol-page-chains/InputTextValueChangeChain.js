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

  class InputTextValueChangeChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, previousValue, value, updatedFrom, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (value !== null && value !== 'undefined') {
        $variables.qaCurrentRow.activity_total_cumm = Number($variables.qaCurrentRow.activity_done_for_month) * 2;
      }
    }
  }

  return InputTextValueChangeChain;
});
