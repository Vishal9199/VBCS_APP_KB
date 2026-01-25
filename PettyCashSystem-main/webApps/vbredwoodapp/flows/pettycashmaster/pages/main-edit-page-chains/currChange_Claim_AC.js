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

  class currChange_Claim_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     * @param {any} params.key
     * @param {any} params.data
     * @param {any} params.metadata
     * @param {any} params.valueItem
     */
    async run(context, { event, previousValue, value, updatedFrom, key, data, metadata, valueItem }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      console.log("++++++++++++++111111111111: ", key);

      if (value !== null && value !== 'undefined') {
        if (key === 'OMR') {
          $variables.claimLineForm.exchange_rate = 1;
        }
        else {
          await Actions.resetVariables(context, {
            variables: [
              '$variables.claimLineForm.exchange_rate',
            ],
          });
        }
      }
    }
  }

  return currChange_Claim_AC;
});
