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

  class editMilestoneChain extends ActionChain {

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

      // Populate form with selected row, mapping API field names to form field names
      $variables.milestoneVar = {
        ...current.row,
        milestone: current.row.milestone,
        by_target_date:    current.row.by_target_date,
      };
      $variables.isMilestoneCreate = 'N';

      console.log('✏️ editMilestoneChain: milestone_id =', current.row.milestone_id);

      const dialog = document.getElementById('milestoneDialog');
      if (dialog) dialog.open();
    }
  }

  return editMilestoneChain;
});