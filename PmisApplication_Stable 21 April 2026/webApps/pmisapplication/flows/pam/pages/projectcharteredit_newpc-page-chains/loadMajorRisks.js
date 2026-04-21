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

  class loadMajorRisks extends ActionChain {

    /**
     * Load major risks table for current project charter
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables } = context;

      try {
        // Check if parent ID exists
        if (!$variables.projectCharterVar.project_charter_id) {
          console.warn('⚠️ No project charter ID available');
          return;
        }

        console.log('⚠️ Loading major risks for project charter:', $variables.projectCharterVar.project_charter_id);

        let enc_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.projectCharterVar.project_charter_id,
          },
        });

        // Call REST endpoint to fetch major risks
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamProjectcharterRiskGetbyid',
          headers: {
            'x-session-id': enc_key,
          },
        });

        console.log('📥 Major risks response:', response.body);

        // Update ADP with fetched data
        if (response.body && response.body.items && Array.isArray(response.body.items)) {
          $variables.ADPmajorRisk.data = response.body.items;
          console.log(`✅ Loaded ${response.body.items.length} major risk records`);
        } else {
          $variables.ADPmajorRisk.data = [];
          console.log('✅ No major risk records found');
        }

      } catch (error) {
        console.error('❌ Error loading major risks:', error);
        
        // Show error notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Error loading major risks',
          message: error.message || 'An unexpected error occurred',
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return loadMajorRisks;
});