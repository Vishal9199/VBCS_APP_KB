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

  class loadEstimateCosts extends ActionChain {

    /**
     * Load estimate costs table for current project charter
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

        console.log('📋 Loading estimate costs for project charter:', $variables.projectCharterVar.project_charter_id);

        let enc_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.projectCharterVar.project_charter_id,
          },
        });

        // Call REST endpoint to fetch estimate costs
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamProjectcharterEstcostGetbyid',
          headers: {
            'x-session-id': enc_key,
          },
        });

        console.log('📥 Estimate costs response:', response.body);

        // Update ADP with fetched data
        if (response.body && response.body.items && Array.isArray(response.body.items)) {
          $variables.ADPestimateCost.data = response.body.items;
          console.log(`✅ Loaded ${response.body.items.length} estimate cost records`);
        } else {
          $variables.ADPestimateCost.data = [];
          console.log('✅ No estimate cost records found');
        }

      } catch (error) {
        console.error('❌ Error loading estimate costs:', error);
        
        // Show error notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Error loading estimate costs',
          message: error.message || 'An unexpected error occurred',
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return loadEstimateCosts;
});