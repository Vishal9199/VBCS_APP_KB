define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class selectedTabListener extends ActionChain {
    async run(context, { event, previousValue, value, updatedFrom, selection }) {
      const { $page, $flow, $application, $variables } = context;

      // Helper: direct ADP.data assignment (correct VBCS pattern)
      const loadTabData = async (typeKey, adpVarName) => {
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

        console.log(typeKey + ' tab data:', JSON.stringify(dataResponse.body.OUTPUT));

        // CORRECT VBCS pattern: direct assignment to ADP.data
        $variables[adpVarName].data = dataResponse.body.OUTPUT || [];
      };

      // await Actions.fireNotificationEvent(context, {
      //   summary: event.detail.value,
      // });

      switch (event.detail.value) {
        case 'qualityAssurance':
          await loadTabData('QUALITY_ASSURANCE', 'qualityAssuranceADP');
          break;
        case 'continualImprovement':
          await loadTabData('CONTINUAL_IMPROVE', 'continualImproveADP');
          break;
        case 'qualityControl':
          await loadTabData('QUALITY_CONTROL', 'qualityControlADP');
          break;
        case 'disciplineWiseInspection':
          await loadTabData('DISCIPLINE_DTL', 'disciplineADP');
          break;
        default:
          break;
      }
    }
  }

  return selectedTabListener;
});