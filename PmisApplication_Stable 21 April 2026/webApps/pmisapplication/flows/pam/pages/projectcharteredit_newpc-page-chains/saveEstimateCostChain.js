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

  class saveEstimateCostChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables } = context;

      try {
        // Validate form
        const validationResult = document.getElementById('estimateCostForm').valid;
        if (validationResult === 'invalid') {
          await Actions.fireNotificationEvent(context, {
            summary: 'Validation Error',
            message: 'Please fill in all required fields correctly',
            type: 'error',
            displayMode: 'transient',
          });
          return;
        }

        if ($variables.estimateCostMode === 'add') {
          // Add new record to ADP
          const newEstCost = JSON.parse(JSON.stringify($variables.estimateCostVar));
          newEstCost.est_cost_id = Date.now(); // Temporary ID
          
          const currentData = $variables.ADPestimateCost.data || [];
          currentData.push(newEstCost);
          $variables.ADPestimateCost.data = currentData;

        } else if ($variables.estimateCostMode === 'edit') {
          // Update existing record in ADP
          const currentData = $variables.ADPestimateCost.data || [];
          const index = currentData.findIndex(item => 
            item.est_cost_id === $variables.estimateCostVar.est_cost_id
          );
          
          if (index !== -1) {
            currentData[index] = JSON.parse(JSON.stringify($variables.estimateCostVar));
            $variables.ADPestimateCost.data = currentData;
          }
        }

        // Refresh ADP
        await Actions.fireDataProviderEvent(context, {
          target: $variables.ADPestimateCost,
          refresh: null,
        });

        // Close dialog
        const dialogElement = document.getElementById('estimateCostDialog');
        if (dialogElement) {
          dialogElement.close();
        }

        await Actions.fireNotificationEvent(context, {
          summary: 'Success',
          message: 'Estimate cost saved successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to save estimate cost: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }
  }

  return saveEstimateCostChain;
});