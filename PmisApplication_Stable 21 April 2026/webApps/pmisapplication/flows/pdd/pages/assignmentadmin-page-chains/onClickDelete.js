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

  class onClickDelete extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const rowKey = Number($variables.p_key);

      // ✅ If row is newly added (no real backend ID), remove from ADP data array directly
      const isNewRow = !$variables.postAssignmentVar.tender_id &&
                       !$variables.postAssignmentVar.tender_number;

      if (isNewRow) {
        // ✅ Filter out the row from the ADP data array
        $variables.projectAssignmentADP.data = $variables.projectAssignmentADP.data.filter(
          row => row.project_assignment_id !== rowKey
        );

        await Actions.fireNotificationEvent(context, {
          displayMode: 'persist',
          summary: 'Row deleted successfully',
          type: 'confirmation',
        });

        await Actions.callComponentMethod(context, {
          selector: '#delete_dialog',
          method: 'close',
        });

        return;
      }

      // Existing row — call REST API
      let enc_p_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.p_key,
        },
      });

      let enc_method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'DELETE',
        },
      });

      let enc_payload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.postAssignmentVar,
        },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/postPmispddProjectassProcess',
        headers: {
          'x-session-code': enc_method,
          'x-session-id': enc_p_key,
        },
        body: {
          payload: enc_payload,
        },
      });

      if (response.body.P_ERR_CODE === 'S') {
        // ✅ Filter out the deleted row from ADP data array
        $variables.projectAssignmentADP.data = $variables.projectAssignmentADP.data.filter(
          row => row.project_assignment_id !== rowKey
        );

        await Actions.fireNotificationEvent(context, {
          displayMode: 'persist',
          summary: 'Row deleted successfully',
          type: 'confirmation',
        });

        await Actions.callComponentMethod(context, {
          selector: '#delete_dialog',
          method: 'close',
        });
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          type: 'error',
        });

        await Actions.callComponentMethod(context, {
          selector: '#delete_dialog',
          method: 'close',
        });
      }
    }
  }

  return onClickDelete;
});