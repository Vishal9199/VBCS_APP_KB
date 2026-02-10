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

  class budgetClearAction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Clear all year values and additional info
          // $variables.budgetCostLineVar = {
            // year_value1: 0, year_value2: 0, year_value3: 0, year_value4: 0, year_value5: 0,
            // year_value6: 0, year_value7: 0, additional_info: '' };

            $variables.budgetCostLineVar = {
              ...$variables.budgetCostLineVar,  // âœ… Preserves ALL existing fields
              // Clear only these data fields
              year_value1: 0,
              year_value2: 0,
              year_value3: 0,
              year_value4: 0,
              year_value5: 0,
              year_value6: 0,
              year_value7: 0
            };
            
              // year_prompt1: '',
              // year_prompt2: '',
              // year_prompt3: '',
              // year_prompt4: '',
              // year_prompt5: '',
              // year_prompt6: '',
              // year_prompt7: '',
            $variables.activeYearFieldIndex = null;
            $variables.budgetValidationMessage = '';

        await Actions.fireNotificationEvent(context, {
          summary: 'Form Cleared',
          message: 'Budget form has been cleared',
          displayMode: 'transient',
          type: 'info',
        });

      } catch (error) {
        console.error('Error clearing budget form:', error);
      }
    }
  }

  return budgetClearAction;
});