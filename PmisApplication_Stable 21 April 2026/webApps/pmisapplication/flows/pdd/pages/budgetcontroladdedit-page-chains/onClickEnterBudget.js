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

  class onClickEnterBudget extends ActionChain {

    /**
     * Called when "Enter Budget" button is clicked.
     * Calls the budget_control_line_insert procedure to create line rows,
     * then loads the data and enables edit mode.
     * Endpoint: postPmispddBudgetcontrolLineInsert
     *
     * Encrypted header ID sourcing:
     *   pNavEncId  — set from the POST response header after a CREATE→Save flow.
     *                Already encrypted. pNavId is still encryptAC('0') in this case.
     *   pNavId     — passed already encrypted from the search page URL on direct EDIT.
     *   Rule: use pNavEncId if present, otherwise use pNavId — NO re-encryption needed.
     *
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        const dlg = document.getElementById('progressDialog');
        if (dlg) dlg.open();

        // ── RESOLVE ENCRYPTED HEADER ID — no encryption needed ───────────
        const enc_header_id = $variables.pNavEncId || $variables.pNavId;
        // ─────────────────────────────────────────────────────────────────

        // Encrypt the username
        let enc_user = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $application.user.email,
          },
        });

        // Call the line insert endpoint
        // Maps to NWS_PMIS_PDD_BUDGET_CTRL_LINES_PKG.budget_control_line_insert
        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddBudgetcontrolLineInsert',
          headers: {
            'x-session-id': enc_header_id,
            'x-user-name':  enc_user,
          },
        });

        if (response.body && response.body.P_ERR_CODE === 'S') {
          // Load the newly created lines into the table
          await Actions.callChain(context, { chain: 'SynBudgetLinesAC' });

          // Enable inline editing
          $variables.lvBudgetEditMode = true;

          await Actions.fireNotificationEvent(context, {
            summary: 'Budget lines created. You can now enter values.',
            type: 'confirmation',
            displayMode: 'transient',
          });

        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Failed to create budget lines.',
            type: 'error',
            displayMode: 'transient',
          });
        }

      } catch (error) {
        console.error('onClickEnterBudget error:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Unexpected error: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });

      } finally {
        const dlg = document.getElementById('progressDialog');
        if (dlg) dlg.close();
      }
    }
  }

  return onClickEnterBudget;
});