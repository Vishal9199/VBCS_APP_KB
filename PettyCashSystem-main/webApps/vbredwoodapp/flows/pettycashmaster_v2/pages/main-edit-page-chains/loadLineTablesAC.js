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

  class loadLineTablesAC extends ActionChain {

    /**
     * To be called in vbAfterNavigateListner
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const results = await Promise.all([
        async () => {

          let tempPayload = {
            'in_limit': 10,
            'in_offset': 0,
            'p_created_by': '',
            'p_keyword': '',
            'p_claim_line_id': '',
            'p_claim_header_id': $variables.p_nav_id,
            'p_cost_center_segment': '',
            'p_accounts_segment': '',
            'p_budget_status': '',
            'p_currency': '',
          };

          let encClaimLine = await Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: {
              plainText: tempPayload,
            },
          });

          console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++2: ", encClaimLine);

          let response = await Actions.callRest(context, {
            endpoint: 'ORDS/postPettycashLineSearch',
            body: {
              "payload": encClaimLine
            },
          });

          $variables.claimLineADP.data = response.body.P_OUTPUT;
          // Calculate Total Claim Amount
          if (response.body.P_OUTPUT && response.body.P_OUTPUT.length > 0) {
            let totalClaim = response.body.P_OUTPUT.reduce((sum, line) => {
              return sum + (Number(line.line_amount) || 0);
            }, 0);

            $variables.totalsVar.total_line_amount = totalClaim;

            // Recalculate header amounts:
            // 1. Line Amount

            $variables.payload.claim_amt = totalClaim; } else {
            $variables.totalsVar.total_line_amount = 0;
          }

          if (response.body.OUT_HAS_NEXT === 'Y') {
            $variables.pagination.claimLine_is_prev = false;
          } else {
            $variables.pagination.claimLine_is_next = true;
          }

          if ($variables.SearchObj_ClaimLine.in_offset === '0') {
            $variables.pagination.claimLine_is_prev = true;
          } else {
            $variables.pagination.claimLine_is_next = false;
          }
        },
        async () => {

          const tempPayload2 = {
            'in_limit': 10,
            'in_offset': 0,
            'p_created_by': '',
            'p_keyword': '',
            'p_claim_receipt_id': '',
            'p_claim_header_id': $variables.p_nav_id,
            'p_mode_of_payment': '',
            'p_reference_number': '',
            'p_currency': '',
          };

          let encReceiptLine = await Actions.callChain(context, {
            chain: 'application:encLargePayloadWithTime',
            params: {
              plainText: tempPayload2,
            },
          });

          console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++2: ", encReceiptLine);

          const response2 = await Actions.callRest(context, {
            endpoint: 'ORDS/postPettycashReceiptSearch',
            body: {
              payload: encReceiptLine,
            },
          });

          console.log("@@@@@@@@@@@@@@@@@@@@ 1: ", response2.body);
          console.log("@@@@@@@@@@@@@@@@@@@@ 2: ", response2.body.P_OUTPUT);

          $variables.receiptLineADP.data = response2.body.P_OUTPUT;
          // Calculate Total Receipt Amount
          if (response2.body.P_OUTPUT && response2.body.P_OUTPUT.length > 0) {
            let totalReceipt = response2.body.P_OUTPUT.reduce((sum, line) => {
              return sum + (Number(line.receipt_line_amount) || 0);
            }, 0);

            $variables.totalsVar.total_receipt_amount = totalReceipt;

            // Re-calculate header amounts:
            // 1. Receipt Amount

            $variables.payload.receipt_amt = totalReceipt;
          } else {
            $variables.totalsVar.total_receipt_amount = 0;
          }

          if (response2.body.OUT_HAS_NEXT === 'Y') {
            $variables.pagination.receiptLine_is_prev = false;
          } else {
            $variables.pagination.receiptLine_is_next = true;
          }

          if ($variables.SearchObj_ReceiptLine.in_offset === '0') {
            $variables.pagination.receiptLine_is_prev = true;
          } else {
            $variables.pagination.receiptLine_is_next = false;
          }
        },
      ].map(sequence => sequence()));

      $variables.payload.close_balance_amt = $variables.payload.open_balance_amt + $variables.payload.receipt_amt - $variables.payload.claim_amt;
      $variables.payload.cash_in_hand = $variables.payload.close_balance_amt - $variables.payload.staff_iou_amt;

    }
  }

  return loadLineTablesAC;
});
