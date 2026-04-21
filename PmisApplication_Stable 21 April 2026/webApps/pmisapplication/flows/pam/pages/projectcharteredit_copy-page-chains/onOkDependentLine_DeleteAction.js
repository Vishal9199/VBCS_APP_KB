// ============================================================================
// FILE: onOkLine_DeleteAction.js  — UPDATED
// Location: projectcharteredit-page-chains/onOkLine_DeleteAction.js
//
// CHANGE: Add 'Dependency' branch to the endpoint switch so that the shared
//         delete_dialog also handles Dependency record deletions.
// ============================================================================

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

  class onOkDependentLine_DeleteAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any}    params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $variables } = context;

      const enc_method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: 'DELETE' },
      });

      // ── ROUTE TO CORRECT ENDPOINT ─────────────────────────────────────
      let endpoint;
      if ($variables.isCostOrRisk === 'Cost') {
        endpoint = 'PAM/postPmispamProjectcharterEstcostProcess';
      } else if ($variables.isCostOrRisk === 'Dependency') {
        endpoint = 'PAM/postPmispamProjectcharterDependencyProcess';  // ← NEW
      } else {
        endpoint = 'PAM/postPmispamProjectcharterRiskProcess';
      }

      const response = await Actions.callRest(context, {
        endpoint: endpoint,
        headers: {
          'x-session-id':   $variables.passKey,
          'x-session-code': enc_method,
        },
        body: {
          payload: $variables.passPayload,
        },
      });

      if (response.body.P_ERR_CODE === 'S') {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'confirmation',
        });

        await Actions.callComponentMethod(context, {
          selector: '#delete_dialog',
          method: 'close',
        });

        // Reload the correct table after deletion
        if ($variables.isCostOrRisk === 'Dependency') {
          await Actions.callChain(context, { chain: 'loadDependencies' });  // ← NEW
        } else {
          await Actions.callChain(context, { chain: 'vbAfterNavigateListener' });
        }

      } else {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return onOkDependentLine_DeleteAction;
});