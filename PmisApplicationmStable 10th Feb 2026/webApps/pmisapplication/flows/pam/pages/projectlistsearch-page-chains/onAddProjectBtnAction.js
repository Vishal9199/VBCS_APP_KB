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

  class onAddProjectBtnAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const lovDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#lovDialog',
        method: 'open',
      });

      await Actions.resetVariables(context, {
        variables: [
    '$variables.passProjectDtlsVar',
  ],
      });
    }
  }

  return onAddProjectBtnAction;
});
