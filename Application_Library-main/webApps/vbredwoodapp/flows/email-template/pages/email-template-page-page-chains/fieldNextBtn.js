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

  class fieldNextBtn extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Increase offset by limit amount
      $variables.searchFieldObj.IN_OFFSET = +$variables.searchFieldObj.IN_OFFSET + +$variables.searchFieldObj.IN_LIMIT;

      // Reload field table with new offset
      await Actions.callChain(context, {
        chain: 'loadEmailFieldAC',
      });
    }
  }

  return fieldNextBtn;
});