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

  class loadMilestones extends ActionChain {

    /**
     * Fetches milestones for current project charter from the API.
     * 
     * @param {Object} context
     */
    async run(context) {
      const { $variables } = context;

      try {
        if (!$variables.pNavId || $variables.pNavId === '0') {
          console.warn('⚠️ loadMilestones: No project charter ID (pNavId) available');
          return;
        }

        console.log('📋 Loading milestones for charter ID:', $variables.pNavId);

        let sessionId = $variables.pNavId;
        if($variables.taskId != null) {
          const enc_pNavId_from_pendingList = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.pNavId,
            },
          });
          sessionId = enc_pNavId_from_pendingList;
        }

        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamProjectcharterMilestoneGetbyprojectcharterid',
          uriParams: { 
            // p_project_charter_id: $variables.pNavId
            p_project_charter_id: sessionId
          },
        });

        console.log('📥 Milestones response:', response.body);

        if (response.body && Array.isArray(response.body.items)) {
          $variables.ADPmilestone.data = response.body.items;
          console.log(
            '%cMilestone Lines loaded',
            'color:#1971c2;font-weight:bold;',
            $variables.ADPmilestone.data
          );
        } else {
          $variables.ADPmilestone.data = [];
        }

      } catch (error) {
        $variables.ADPmilestone.data = [];
        console.warn('No milestone lines found or error loading:', error);
      }
    }
  }

  return loadMilestones;
});