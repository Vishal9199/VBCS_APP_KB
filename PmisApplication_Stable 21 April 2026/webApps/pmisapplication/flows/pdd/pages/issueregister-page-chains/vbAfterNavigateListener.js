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
        // ── 1. Load Project / Tender Header Info ──────────────────────────
        const projectResponse = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
          headers: { 'x-session-id': $application.variables.pTenderId },
        });

        if (projectResponse.body && projectResponse.body.items && projectResponse.body.items[0]) {
          $variables.projectName   = projectResponse.body.items[0].project_name   || '';
          $variables.projectNumber = projectResponse.body.items[0].project_number || '';
          $variables.tenderNumber  = projectResponse.body.items[0].tender_number  || '';
          $variables.project_id    = projectResponse.body.items[0].project_id     || '';
          $variables.tender_id     = projectResponse.body.items[0].tender_id      || '';
        }

        // ── 2. Static LOVs ────────────────────────────────────────────────

        // Scope / Time / Cost / QHSE — shared ADP (values 1–5)
        $variables.ADPscope.data = [
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 },
          { label: '5', value: 5 },
        ];

        // Priority
        $variables.ADPpriority.data = [
          { label: 'Low',      value: 'Low' },
          { label: 'Moderate', value: 'Moderate' },
          { label: 'High',     value: 'High' },
          { label: 'Extreme',  value: 'Extreme' },
        ];

        // Progress % — 10% increments
        $variables.ADPprogress.data = [
          { label: '10%',  value: 10  },
          { label: '20%',  value: 20  },
          { label: '30%',  value: 30  },
          { label: '40%',  value: 40  },
          { label: '50%',  value: 50  },
          { label: '60%',  value: 60  },
          { label: '70%',  value: 70  },
          { label: '80%',  value: 80  },
          { label: '90%',  value: 90  },
          { label: '100%', value: 100 },
        ];

        // ── 3. Load Issue Table Data ──────────────────────────────────────
        try {
          // const encryptedTenderId = await Actions.callChain(context, {
          //   chain: 'application:encryptAC',
          //   params: { input: String($application.variables.pTenderId) },
          // });

          const issueResponse = await Actions.callRest(context, {
            endpoint: 'PDD/getPmispddIssueregisterGetbytenderid',
            headers: { 'x-session-id': $application.variables.pTenderId },
          });

          $variables.ADPissue.data = issueResponse.body.items || issueResponse.body.OUTPUT || [];
          console.log('Issue data loaded:', $variables.ADPissue.data.length, 'records');
        } catch (e) {
          console.error('Issue data load failed:', e);
          $variables.ADPissue.data = [];
        }

        // ── 4. BDP submittableChange Listener ────────────────────────────
        $page.variables.issueBufferDP.instance.addEventListener('submittableChange', (evt) => {
          console.log('Issue BDP submittable items changed:', evt.detail.length);
        });

      } catch (error) {
        console.error('vbAfterNavigateListener error:', error);
      }
    }
  }

  return vbAfterNavigateListener;
});