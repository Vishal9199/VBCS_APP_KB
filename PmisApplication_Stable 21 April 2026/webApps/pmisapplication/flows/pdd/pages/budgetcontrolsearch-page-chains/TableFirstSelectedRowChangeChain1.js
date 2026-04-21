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

  class TableFirstSelectedRowChangeChain1 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {object} params.previousValue
     * @param {object} params.value
     * @param {string} params.updatedFrom
     * @param {any} params.rowKey
     * @param {any} params.rowData
     * @param {any} params.firstSelectedRow
     */
    async run(context, { event, previousValue, value, updatedFrom, rowKey, rowData, firstSelectedRow }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        const year = rowData.year;
        // await Actions.fireNotificationEvent(context, {
        //   summary: rowData.year,
        //   displayMode: 'transient',
        //   type: 'confirmation',
        // });
        console.log("Header Year: ", year);
        $variables.lvBudgetTableColumns = $page.functions.buildBudgetColumns(year);
        console.log(JSON.stringify($variables.lvBudgetTableColumns));
        // Build the search payload
        const searchPayload = {
          in_limit:                   '10',
          in_offset:                  '0',
          p_budget_control_header_id: rowKey
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

  return TableFirstSelectedRowChangeChain1;
});