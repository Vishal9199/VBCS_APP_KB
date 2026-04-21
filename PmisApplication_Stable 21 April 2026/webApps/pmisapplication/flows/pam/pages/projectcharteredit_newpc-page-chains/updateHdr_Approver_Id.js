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

  class updateHdr_Approver_Id extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.projectCharterVar.approver_id = $variables.selectedApproverUser_id;

      if ($variables.projectCharterVar.approver_id != null) {

        await Actions.callChain(context, {
          chain: 'saveAndCloseChain',
        });

        $variables.isFirstApproverUpdated = 'Y';
        await Actions.callChain(context, {
            chain: 'submitForApprovalAction',
          });

        const selectFirstApproverClose = await Actions.callComponentMethod(context, {
          selector: '#selectFirstApprover',
          method: 'close',
        });
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please select the Asset Planning Manager.',
          type: 'warning',
          displayMode: 'transient',
        });
      }
    }
  }

  return updateHdr_Approver_Id;
});
