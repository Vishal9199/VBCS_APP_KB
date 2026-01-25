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

  class vbAfterNavigateListener extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{previousPage:string,previousPageParams:any,currentPage:string,currentPageParams:any}} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;


      $variables.selectedTab = 'claimLine';

      $variables.payload.integration_status_name = 'Draft';
      $variables.payload.status_name = 'Draft';
      $variables.payload.petty_cash_type = $functions.getWaterCategory($application.variables.getDatarestrictionTypeVar.restriction_name);
      
      console.log("input_str001: ", $application.variables.getDatarestrictionTypeVar.restriction_name);
      console.log("Petty Cash Type: ", $variables.payload.petty_cash_type);

      $variables.payload.saas_transaction_id = undefined;
      $variables.payload.saas_transaction_number = undefined;
      $variables.payload.object_version_num = 0;
      $variables.payload.claim_amt = 0;
      $variables.payload.line_count = 0;
      $variables.payload.receipt_amt = 0;
      $variables.payload.receipt_count = 0;

      if ($variables.p_nav_id !== '0') {

        $variables.SearchObj.p_claim_header_id = $variables.p_nav_id;

        let headerDetails = await Actions.callChain(context, {
          chain: 'application:encLargePayloadWithTime',
          params: {
            plainText: $variables.SearchObj,
          },
        });

        console.log("++++++++++++++++++++++++++++++1 searchObj: ", headerDetails);

        $variables.encSearchObj.payload = headerDetails;

        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postPettycashHeaderSearch',
          body: $variables.encSearchObj,
        });

        $variables.payload = response.body.P_OUTPUT[0];
        $variables.payload_view = response.body.P_OUTPUT[0];

        await Actions.callChain(context, {
          chain: 'toolBarAC',
          params: {
            taskId: $variables.taskId,
            statusCode: response.body.P_OUTPUT[0].status_code,
          },
        });

        await Actions.callChain(context, {
          chain: 'loadLineTablesAC',
        });
      } else {
        await Actions.callChain(context, {
          chain: 'toolBarAC',
          params: {
            statusCode: 'DRA',
          },
        });
      }
    }
  }

  return vbAfterNavigateListener;
});
