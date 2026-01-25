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

  class delete_claim_line_AC extends ActionChain {

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

      // $variables.passLineType_id = key;
      if($variables.selectedTab === 'claimLine') {
        $variables.claimLineForm_Delete = current.row;
        $variables.passLineType_id = current.row.claim_line_id;
      }
      else {
        $variables.receiptLineForm_Delete = current.row;
        $variables.passLineType_id = current.row.claim_receipt_id;
      }

      const deleteDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'open',
      });
    }
  }

  return delete_claim_line_AC;
});