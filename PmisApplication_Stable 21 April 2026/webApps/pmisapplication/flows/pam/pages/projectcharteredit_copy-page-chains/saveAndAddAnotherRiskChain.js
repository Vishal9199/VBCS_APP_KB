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

  class saveAndAddAnotherRiskChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $variables } = context;

      try {
        // Validate form
        const validationResult = document.getElementById('majorRiskForm').valid;
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
        const newRisk = JSON.parse(JSON.stringify($variables.majorRiskVar));
        newRisk.major_risk_id = Date.now();
        
        const currentData = $variables.ADPmajorRisk.data || [];
        currentData.push(newRisk);
        $variables.ADPmajorRisk.data = currentData;

        // Refresh ADP
        await Actions.fireDataProviderEvent(context, {
          target: $variables.ADPmajorRisk,
          refresh: null,
        });

        // Reset form for next entry
        await Actions.resetVariables(context, {
          variables: [
            '$variables.majorRiskVar',
          ],
        });

        await Actions.fireNotificationEvent(context, {
          summary: 'Success',
          message: 'Major risk saved. Ready to add another.',
          type: 'confirmation',
          displayMode: 'transient',
        });

      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to save major risk: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }
  }

  return saveAndAddAnotherRiskChain;
});