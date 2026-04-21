define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class vbAfterNavigateListener extends ActionChain {

    async run(context, { event }) {
      const { $page, $application, $variables } = context;

      try {
        // ── 1. Load Project / Tender Info ─────────────────────────────────
        const projectResponse = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
          headers: { 'x-session-id': $application.variables.pTenderId },
        });

        if (projectResponse.body && projectResponse.body.items && projectResponse.body.items[0]) {
          $variables.projectName   = projectResponse.body.items[0].project_name   || '';
          $variables.projectNumber = projectResponse.body.items[0].project_number || '';
          $variables.tenderNumber  = projectResponse.body.items[0].tender_number  || '';
          $variables.oraProjectId  = projectResponse.body.items[0].project_id || '';
          $variables.tenderId      = projectResponse.body.items[0].tender_id || '';
        }

        // ── 2. Static LOVs ────────────────────────────────────────────────

        $variables.ADPscope.data = [{ label: '1', value: 1 },{ label: '2', value: 2 },{ label: '3', value: 3 },{ label: '4', value: 4 },{ label: '5', value: 5 },];

        $variables.ADPstatus.data = [{ label: 'Open', value: 'Open' },{ label: 'Closed', value: 'Closed' }, { label: 'Issue Log', value: 'Issue Log' },];

        $variables.ADPstrength.data = [{ label: 'Minor', value: 'Minor' }, { label: 'Moderate', value: 'Moderate' }, { label: 'Major', value: 'Major' },];

        $variables.ADPrating.data = [{ label: 'Low', value: 'Low' }, { label: 'Moderate', value: 'Moderate' }, { label: 'Major', value: 'Major' }, { label: 'High', value: 'High' },];

        $variables.ADPstrategy.data = [
          { label: 'Mitigate', value: 'Mitigate' },
          { label: 'Accept',   value: 'Accept' },
          { label: 'Transfer', value: 'Transfer' },
          { label: 'Avoid',    value: 'Avoid' },
        ];

        $variables.ADPoccurrence.data = [
          { label: 'Pre-Construction',  value: 'Pre-Construction' },
          { label: 'Construction',      value: 'Construction' },
          { label: 'Post-Construction', value: 'Post-Construction' },
          { label: 'Rare',              value: 'Rare' },
          { label: 'Unlikely',          value: 'Unlikely' },
          { label: 'Possible',          value: 'Possible' },
          { label: 'Likely',            value: 'Likely' },
        ];

        // ── 3. API LOVs ───────────────────────────────────────────────────

        try {
          const catResponse = await Actions.callRest(context, {
            endpoint: 'PAM/getCommonLovLookup',
            headers: {
              'p_lookup_type_code': 'PMIS_PDD_RISK_CATEGORY',
            },
          });
          $variables.ADPriskCategory.data = (catResponse.body.items || []).map(item => ({
            label: item.lookup_value_name,
            value: item.lookup_value_id,
          }));
        } catch (e) {
          console.warn('Risk Category LOV failed:', e);
          $variables.ADPriskCategory.data = [];
        }

        try {
          const lhResponse = await Actions.callRest(context, {
            endpoint: 'PAM/getCommonLovLookup',
            headers: {  'p_lookup_type_code': 'PMIS_PDD_RISK_LIKELIHOOD', },
          });
          $variables.ADPlikelihood.data = (lhResponse.body.items || []).map(item => ({
            label: item.lookup_value_name,
            value: item.lookup_value_id,
          }));
        } catch (e) {
          console.warn('Likelihood LOV failed:', e);
          $variables.ADPlikelihood.data = [];
        }

        try {
          const ownerResponse = await Actions.callRest(context, {
            endpoint: 'PAM/getCommonLovLookup',
            headers: {  'p_lookup_type_code': 'PMIS_PDD_RISK_OWNER', },
          });
          $variables.ADPowner.data = (ownerResponse.body.items || []).map(item => ({
            label: item.lookup_value_name,
            value: item.lookup_value_id,
          }));
        } catch (e) {
          console.warn('Owner LOV failed:', e);
          $variables.ADPowner.data = [];
        }

        // ── 4. Load Risk Table Data ───────────────────────────────────────
        try {
          // const encryptedTenderId = await Actions.callChain(context, {
          //   chain: 'application:encryptAC',
          //   params: { input: String($application.variables.pTenderId) },
          // });

          const riskResponse = await Actions.callRest(context, {
            endpoint: 'PDD/getPmispddRiskmanageGetbytenderid',
            headers: { 'x-session-id': $application.variables.pTenderId },
          });

          $variables.ADPrisk.data = riskResponse.body.items || riskResponse.body.OUTPUT || [];
          console.log('Risk data loaded:', $variables.ADPrisk.data.length, 'records');
        } catch (e) {
          console.error('Risk data load failed:', e);
          $variables.ADPrisk.data = [];
        }

        // ── 5. BDP submittableChange Listener ────────────────────────────
        $page.variables.riskBufferDP.instance.addEventListener('submittableChange', (evt) => {
          console.log('Risk BDP submittable items changed:', evt.detail.length);
        });

      } catch (error) {
        console.error('vbAfterNavigateListener error:', error);
      }
    }
  }

  return vbAfterNavigateListener;
});