define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class vbEnterListener extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Load main table data
      await Actions.callChain(context, { chain: 'SynADPFutureProjectsAC' });

      // Pre-load Senior Manager LOV
      try {
        const seniorResp = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamLovUsers',
        });
        $variables.ADPseniorManager.data = seniorResp.body.items || [];
      } catch (e) { console.error('Failed to load senior manager LOV:', e); }

      // Pre-load Project Manager LOV
      try {
        const pmResp = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamLovUsers',
        });
        $variables.ADPprojectManager.data = pmResp.body.items || [];
      } catch (e) { console.error('Failed to load project manager LOV:', e); }

      // Pre-load Region LOV
      try {
        const regionResp = await Actions.callRest(context, {
          endpoint: 'PmisSetup/getPmisLovRegionName',
        });
        $variables.ADPregion.data = regionResp.body.items || [];
      } catch (e) { console.error('Failed to load region LOV:', e); }

      // Pre-load Year LOV
      try {
        const yearResp = await Actions.callRest(context, {
          endpoint: 'PmisSetup/getPmisLovYear',
        });
        $variables.ADPyear.data = yearResp.body.items || [];
      } catch (e) { console.error('Failed to load year LOV:', e); }

      // Attach BDP submittable change listener
      $page.variables.futureProjectBDP.instance.addEventListener('submittableChange', (event) => {
        console.log('BDP submittableChange ==> ' + event.detail.length + ' items pending.');
      });
    }
  }

  return vbEnterListener;
});