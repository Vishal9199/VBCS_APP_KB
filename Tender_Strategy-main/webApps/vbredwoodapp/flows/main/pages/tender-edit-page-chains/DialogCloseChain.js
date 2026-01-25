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

  class DialogCloseChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.fireDataProviderEvent(context, {
        refresh: null,
        target: $variables.getTenderStrategyReviewerReassignListListSDP,
      });

      await Actions.resetVariables(context, {
        variables: [
    '$flow.variables.responseComments',
  ],
      });
    }
  }

  return DialogCloseChain;
});
