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

  class BooleanCheckboxComponentValueChangeChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {boolean} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, previousValue, value, updatedFrom, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (value === false && key === $variables.postFypHdrVar.project_id) {
        await Actions.resetVariables(context, {
          variables: [
    '$variables.postFypHdrVar.project_id',
  ],
        });
      }
    }
  }

  return BooleanCheckboxComponentValueChangeChain;
});
