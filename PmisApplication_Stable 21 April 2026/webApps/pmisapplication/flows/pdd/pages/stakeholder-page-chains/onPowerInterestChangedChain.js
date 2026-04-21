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

  class onPowerInterestChangedChain extends ActionChain {

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
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context) {
      const { $page, $variables } = context;

      const power = $variables.lvCurrentStakeholderRow.power;
      const interest = $variables.lvCurrentStakeholderRow.interest;

      let strategy = '';

      if (power !== null && interest !== null) {
        if (power < 5 && interest < 5) {
          strategy = 'Monitor';
        } else if (power <= 5 && interest >= 5) {
          strategy = 'Keep Informed';
        } else if (power >= 6 && interest < 5) {
          strategy = 'Keep Satisfied';
        } else if (power >= 6 && interest >= 6) {
          strategy = 'Manage Closely';
        }
      }

      $variables.lvCurrentStakeholderRow.approach_strategy = strategy;
    }
  }

  return onPowerInterestChangedChain;
});
