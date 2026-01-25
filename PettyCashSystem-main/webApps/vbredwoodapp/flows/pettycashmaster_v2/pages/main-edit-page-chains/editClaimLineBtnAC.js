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

  class editClaimLineBtnAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const claimCreateDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#claimCreateDialog',
        method: 'open',
      });

      $variables.claimLineForm = current.row;

      $variables.claimLineForm.amount_in_omr = $variables.claimLineForm.amount * $variables.claimLineForm.exchange_rate;
    }
  }

  return editClaimLineBtnAC;
});
