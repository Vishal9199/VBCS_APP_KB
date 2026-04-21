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

  class onClickUpdateBudget extends ActionChain {

    /**
     * Called when "Update Budget" button is clicked on an existing budget.
     * Enables inline editing on the table.
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.lvBudgetEditMode = true;

      await Actions.fireNotificationEvent(context, {
        summary: 'Table is now editable. Click a row to edit values.',
        type: 'confirmation',
        displayMode: 'transient',
      });
    }
  }

  return onClickUpdateBudget;
});