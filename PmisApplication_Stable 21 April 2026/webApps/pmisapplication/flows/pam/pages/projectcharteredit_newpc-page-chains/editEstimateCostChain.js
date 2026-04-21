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

  class editEstimateCostChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {any} params.current
     * @param {any} params.index
     */
    async run(context, { event, originalEvent, key, current, index }) {
      const { $variables } = context;

      // Populate form with selected row data
      $variables.estimateCostVar = current.row;
      
      $variables.isEstCreate = 'N';

      // Set mode to 'edit'
      $variables.estimateCostMode = 'edit';

      // Open dialog
      const dialogElement = document.getElementById('estimateCostDialog');
      if (dialogElement) {
        dialogElement.open();
      }
    }
  }

  return editEstimateCostChain;
});