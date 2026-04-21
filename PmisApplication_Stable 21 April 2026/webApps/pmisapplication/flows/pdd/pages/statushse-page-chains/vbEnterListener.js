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

  class vbEnterListener extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;


      const response2 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
        headers: {
          'x-session-id': $application.variables.pTenderId,
        },
      });

      $variables.headerInfoVar.projectName = response2.body.items[0].project_name;
      $variables.headerInfoVar.projectNumber = response2.body.items[0].project_number;
      $variables.headerInfoVar.tenderNumber = response2.body.items[0].tender_number;
      $variables.periodName = $application.variables.pPeriod;
      console.log("Period: ",$variables.periodName);

      // $variables.getPmispddStatushseGetbytenderidVar = response2.body.items[0];

      $variables.getPmispddStatushseGetbytenderidVar.ora_project_id = response2.body.items[0].project_id;
      $variables.getPmispddStatushseGetbytenderidVar.tender_id = response2.body.items[0].tender_id;
      $variables.getPmispddStatushseGetbytenderidVar.period = $application.variables.pPeriod;

      let enc_period = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $application.variables.pPeriod,
        },
      });

      let enc_project_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.getPmispddStatushseGetbytenderidVar.ora_project_id,
        },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddStatushseGetbytenderid',
        headers: {
          'x-period-name': enc_period,
          'x-project-id': enc_project_id,
          'x-session-id': $application.variables.pTenderId,
        },
      });

       if (response.body.count === 0) {

        $variables.pNavCode = 'CREATE';
        $variables.pNavId = '0';
        $variables.obj_num_dummy = 0;
      } else {
         $variables.getPmispddStatushseGetbytenderidVar = response.body.items[0];
        $variables.pNavCode = 'EDIT';
        $variables.pNavId = response.body.items[0].hse_id;
        $variables.obj_num_dummy = response.body.items[0].object_version_num;
      }

    }
  }

  return vbEnterListener;
});
