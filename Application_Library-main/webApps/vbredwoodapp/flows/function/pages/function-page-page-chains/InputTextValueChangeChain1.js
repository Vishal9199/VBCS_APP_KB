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

  class InputTextValueChangeChain1 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     */
    async run(context, { event, previousValue, value, updatedFrom }) {
      const { $page } = context;

      // Regex to check if value starts with https://
      const urlRegex = /^https:\/\//;

      if (!urlRegex.test(value)) {
        // Show validation error message on the input field
        await Actions.callComponentMethod(context, {
          selector: '#yourInputId',   // <-- replace with your input component ID
          method: 'showMessages',
          params: {
            messages: [{
              severity: 'error',
              summary: 'Invalid URL',
              detail: 'Value must start with https://'
            }]
          }
        });
      } else {
        // Clear validation messages if value is valid
        await Actions.callComponentMethod(context, {
          selector: '#yourInputId',   // <-- replace with your input component ID
          method: 'showMessages',
          params: {
            messages: []
          }
        });
      }
    }
  }

  return InputTextValueChangeChain1;
});
