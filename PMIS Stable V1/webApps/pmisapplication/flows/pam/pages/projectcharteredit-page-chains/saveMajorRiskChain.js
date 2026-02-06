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

  class saveMajorRiskChain extends ActionChain {

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

        if ($variables.majorRiskMode === 'add') {
          // Add new record to ADP
          const newRisk = JSON.parse(JSON.stringify($variables.majorRiskVar));
          newRisk.major_risk_id = Date.now(); // Temporary ID
          
          const currentData = $variables.ADPmajorRisk.data || [];
          currentData.push(newRisk);
          $variables.ADPmajorRisk.data = currentData;

        } else if ($variables.majorRiskMode === 'edit') {
          // Update existing record in ADP
          const currentData = $variables.ADPmajorRisk.data || [];
          const index = currentData.findIndex(item => 
            item.major_risk_id === $variables.majorRiskVar.major_risk_id
          );
          
          if (index !== -1) {
            currentData[index] = JSON.parse(JSON.stringify($variables.majorRiskVar));
            $variables.ADPmajorRisk.data = currentData;
          }
        }

        // Refresh ADP
        await Actions.fireDataProviderEvent(context, {
          target: $variables.ADPmajorRisk,
          refresh: null,
        });

        // Close dialog
        const dialogElement = document.getElementById('majorRiskDialog');
        if (dialogElement) {
          dialogElement.close();
        }

        await Actions.fireNotificationEvent(context, {
          summary: 'Success',
          message: 'Major risk saved successfully',
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

  return saveMajorRiskChain;
});