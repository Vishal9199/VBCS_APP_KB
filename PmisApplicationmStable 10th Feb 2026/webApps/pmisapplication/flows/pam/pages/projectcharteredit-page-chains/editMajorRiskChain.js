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

  class editMajorRiskChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.key
     * @param {any} params.current
     * @param {any} params.event
     * @param {any} params.originalEvent
     * @param {any} params.index
     */
    async run(context, { key, current, event, originalEvent, index }) {
      const { $variables } = context;

      // Populate form with selected row data
      $variables.majorRiskVar = current.row;
      
      $variables.isRiskCreate = 'N';

      // Set mode to 'edit'
      $variables.majorRiskMode = 'edit';

      // Open dialog
      const dialogElement = document.getElementById('majorRiskDialog');
      if (dialogElement) {
        dialogElement.open();
      }
    }
  }

  return editMajorRiskChain;
});