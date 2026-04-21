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

  class yearValue2ChangeAction extends ActionChain {

    async run(context, { value, previousValue }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.callChain(context, {
        chain: 'yearValueChangeValidationAC',
        params: {
          fieldIndex: 2,
          newValue: value,
          previousValue: previousValue,
        },
      });
    }
  }

  return yearValue2ChangeAction;
});