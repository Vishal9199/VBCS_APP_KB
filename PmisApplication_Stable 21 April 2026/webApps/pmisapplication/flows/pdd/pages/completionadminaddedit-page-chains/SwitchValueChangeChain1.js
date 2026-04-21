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

  class SwitchValueChangeChain1 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {boolean} params.previousValue
     * @param {boolean} params.value
     * @param {string} params.updatedFrom
     */
    async run(context, { event, previousValue, value, updatedFrom }) {
      const { $variables } = context;

      // Convert boolean value to 'Y' or 'N'
      $variables.completionVar.completion_close_flag = value ? 'Y' : 'N';
    }
  }

  return SwitchValueChangeChain1;
});