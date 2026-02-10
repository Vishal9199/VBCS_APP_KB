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

  class yearValue1ChangeAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {number} params.value 
     * @param {number} params.previousValue 
     */
    async run(context, { value, previousValue }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.callChain(context, {
        chain: 'yearValueChangeValidationAC',
        params: {
          fieldIndex: 1,
          newValue: value,
          previousValue: previousValue,
        },
      });
    }
  }

  return yearValue1ChangeAction;
});