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

  class closeAddProjectPlanTypeDialog extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.callComponentMethod(context, {
        selector: '#addProjectPlanTypeDialog',
        method: 'close',
      });
    }
  }

  return closeAddProjectPlanTypeDialog;
});