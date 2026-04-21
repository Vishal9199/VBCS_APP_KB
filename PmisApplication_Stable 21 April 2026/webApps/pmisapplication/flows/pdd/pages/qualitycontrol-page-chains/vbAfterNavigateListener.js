define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class vbAfterNavigateListener extends ActionChain {
    async run(context, { event }) {
      const { $page, $flow, $application, $variables } = context;

      // Load project/tender info
      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
        headers: {
          'x-session-id': $application.variables.pTenderId,
        },
      });

      $variables.projectName   = response.body.items[0].project_name;
      $variables.projectNumber = response.body.items[0].project_number;
      $variables.tenderNumber  = response.body.items[0].tender_number;
      $variables.period        = $application.variables.pPeriod || 'FEB-26';

      // Helper: load data for a given type key — direct ADP.data assignment (correct VBCS pattern)
      const loadData = async (typeKey, adpVarName) => {
        let encryptedPeriod = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $application.variables.pPeriod || 'FEB-26' },
        });

        let encryptedType = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: typeKey },
        });

        const dataResponse = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddQualitycontrolCommonGetbyid',
          headers: {
            'p-tender-id': $application.variables.pTenderId,
            'p-period': encryptedPeriod,
            'p-type': encryptedType,
          },
        });

        console.log(typeKey + ' loaded:', JSON.stringify(dataResponse.body.OUTPUT));

        // CORRECT VBCS pattern: direct assignment to ADP.data
        $variables[adpVarName].data = dataResponse.body.OUTPUT || [];
      };

      // Load all 4 tabs on page open
      await loadData('QUALITY_ASSURANCE', 'qualityAssuranceADP');
      await loadData('CONTINUAL_IMPROVE',  'continualImproveADP');
      await loadData('QUALITY_CONTROL',    'qualityControlADP');
      await loadData('DISCIPLINE_DTL',     'disciplineADP');
    }
  }

  return vbAfterNavigateListener;
});