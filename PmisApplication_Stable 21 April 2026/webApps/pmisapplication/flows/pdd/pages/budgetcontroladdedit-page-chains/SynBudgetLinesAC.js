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

  class SynBudgetLinesAC extends ActionChain {

    /**
     * Loads budget control lines for the current header.
     * Endpoint: postPmispddBudgetcontrollinesSearch
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Build the search payload
        const searchPayload = {
          in_limit:                   '30',
          in_offset:                  '0',
          p_budget_control_header_id: $variables.postBudgetHdrVar ? $variables.postBudgetHdrVar.budget_control_header_id : null
        };

        // Encrypt payload using the app-level encryptAC chain
        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: searchPayload,
          },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddBudgetcontrolLineSearch',
          body: {
            payload: enc_payload,
          },
        });

        if (response.ok && response.body.OUT_COUNT >= 1) {
          $variables.budgetLinesADP.data = response.body.P_OUTPUT;
          $variables.lvBudgetHasLines    = true;
        } else {
          $variables.budgetLinesADP.data = [];
          $variables.lvBudgetHasLines    = false;
        }

      } catch (error) {
        console.error('SynBudgetLinesAC error:', error);
        $variables.budgetLinesADP.data = [];
        $variables.lvBudgetHasLines    = false;
      }
    }
  }

  return SynBudgetLinesAC;
});