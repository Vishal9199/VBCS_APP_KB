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

  class yearValueChangeValidationAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {number} params.fieldIndex - Which year field (1-7)
     * @param {number} params.newValue - New value being entered
     * @param {number} params.previousValue - Previous value
     */
    async run(context, { fieldIndex, newValue, previousValue }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log(`Validating year_value${fieldIndex}: ${previousValue} → ${newValue}`);

        const budgetVar = $variables.budgetCostLineVar;
        
        // If new value is 0 or null/undefined, allow the change
        if (!newValue || newValue === 0) {
          console.log('Value is 0 or null, clearing validation');
          
          // Clear active field index if this was the active field
          if ($variables.activeYearFieldIndex === fieldIndex) {
            $variables.activeYearFieldIndex = null;
            $variables.budgetValidationMessage = '';
          }
          
          return; // Allow change
        }

        // Get year labels from calendar year ranges for better error messages
        const yearRanges = $variables.calendarYearRangesADP.data || [];
        const getYearLabel = (index) => {
          if (yearRanges.length >= index) {
            return yearRanges[index - 1].year_prompt || `Year ${index}`;
          }
          return `Year ${index}`;
        };

        // Check if any OTHER field has a value > 0
        const yearFields = [
          { index: 1, value: budgetVar.year_value1, label: getYearLabel(1) },
          { index: 2, value: budgetVar.year_value2, label: getYearLabel(2) },
          { index: 3, value: budgetVar.year_value3, label: getYearLabel(3) },
          { index: 4, value: budgetVar.year_value4, label: getYearLabel(4) },
          { index: 5, value: budgetVar.year_value5, label: getYearLabel(5) },
          { index: 6, value: budgetVar.year_value6, label: getYearLabel(6) },
          { index: 7, value: budgetVar.year_value7, label: getYearLabel(7) },
        ];

        // Find if another field has value > 0
        const otherActiveField = yearFields.find(
          field => field.index !== fieldIndex && field.value > 0
        );

        if (otherActiveField) {
          // REJECT the change - another field already has a value
          console.log(`Rejecting change: ${otherActiveField.label} already has value`);

          const validationMsg = `Only one year range can have a budget value. Please clear "${otherActiveField.label}" first.`;

          // Revert to previous value (0) - Direct property assignment
          const fieldName = `year_value${fieldIndex}`;
          $variables.budgetCostLineVar[fieldName] = 0;
          $variables.budgetValidationMessage = validationMsg;

          // Show error notification
          await Actions.fireNotificationEvent(context, {
            summary: 'Validation Error',
            message: validationMsg,
            displayMode: 'transient',
            type: 'error',
          });

        } else {
          // ACCEPT the change - no other field has value
          console.log(`Accepting change for field ${fieldIndex}`);

          // Set this field as active and clear validation message
          $variables.activeYearFieldIndex = fieldIndex;
          $variables.budgetValidationMessage = '';

          // ✅ CRITICAL FIX: Clear other year fields individually to preserve object structure
          // This updates properties one-by-one instead of replacing the entire object
          for (let i = 1; i <= 7; i++) {
            if (i !== fieldIndex) {
              $variables.budgetCostLineVar[`year_value${i}`] = 0;
            }
          }

          console.log('Other year fields cleared successfully');
        }

      } catch (error) {
        console.error('Error in yearValueChangeValidationAC:', error);
        
        // Show error notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Error',
          message: 'An error occurred during validation. Please try again.',
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return yearValueChangeValidationAC;
});