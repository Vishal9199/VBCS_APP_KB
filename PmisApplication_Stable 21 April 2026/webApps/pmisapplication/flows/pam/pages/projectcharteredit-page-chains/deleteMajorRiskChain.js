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

  class deleteMajorRiskChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.rowData
     */
    async run(context, { rowData }) {
      const { $variables } = context;

      try {
        // Confirm deletion
        const confirmDelete = confirm('Are you sure you want to delete this major risk?');
        
        if (confirmDelete) {
          // Remove from ADP
          const currentData = $variables.ADPmajorRisk.data || [];
          const filteredData = currentData.filter(item => 
            item.major_risk_id !== rowData.major_risk_id
          );
          
          $variables.ADPmajorRisk.data = filteredData;

          // Refresh ADP
          await Actions.fireDataProviderEvent(context, {
            target: $variables.ADPmajorRisk,
            refresh: null,
          });

          await Actions.fireNotificationEvent(context, {
            summary: 'Success',
            message: 'Major risk deleted successfully',
            type: 'confirmation',
            displayMode: 'transient',
          });
        }

      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to delete major risk: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }
  }

  return deleteMajorRiskChain;
});