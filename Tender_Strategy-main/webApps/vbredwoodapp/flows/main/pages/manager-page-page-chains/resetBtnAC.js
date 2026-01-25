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

  class resetBtnAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;
      await Actions.resetVariables(context, {
        variables: [
          '$variables.SearchObj',
        ],
      });

      $variables.triggerSmartSearchActionChain = false;

      await $application.functions.clearSmartSearchChips();
      $variables.tableHeaderADP.data = [];

      $variables.triggerSmartSearchActionChain = true;
    }
  }

  return resetBtnAC;
});