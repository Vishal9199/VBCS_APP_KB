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

  class saveAndAddAnotherEstCostChain extends ActionChain {

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

        // Add new record to ADP
        const newEstCost = JSON.parse(JSON.stringify($variables.estimateCostVar));
        newEstCost.est_cost_id = Date.now();
        
        const currentData = $variables.ADPestimateCost.data || [];
        currentData.push(newEstCost);
        $variables.ADPestimateCost.data = currentData;

        // Refresh ADP
        await Actions.fireDataProviderEvent(context, {
          target: $variables.ADPestimateCost,
          refresh: null,
        });

        // Reset form for next entry
        await Actions.resetVariables(context, {
          variables: [
            '$variables.estimateCostVar',
          ],
        });

        await Actions.fireNotificationEvent(context, {
          summary: 'Success',
          message: 'Estimate cost saved. Ready to add another.',
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

  return saveAndAddAnotherEstCostChain;
});